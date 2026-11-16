import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { supabase } from "@/lib/supabase";

/*
 * Public peer review for /principles-of-intelligence.
 *
 * In review mode a visitor highlights a passage inside one paragraph, a box opens, and their
 * comment is saved to the `manifold_comments` table (see supabase-manifold-comments-schema.sql).
 * Commented passages are tinted at all times, in or out of review mode; clicking one shows what
 * was said. Every paragraph that can be commented on carries data-para="<section id>:<paragraph number>".
 *
 * A comment is anchored by the text it quotes, not by position, so it survives edits elsewhere
 * in the paragraph. If the quoted words themselves are edited away, the comment is still listed
 * but no longer points at a passage.
 */

interface Comment {
  id: string;
  para: string;
  start_offset: number;
  quote: string;
  name: string;
  body: string;
  created_at: string;
}

interface Draft {
  para: string;
  start: number;
  end: number;
  quote: string;
  x: number; // page coordinates of where the box should point
  y: number;
}

interface Thread {
  ids: string[];
  x: number;
  y: number;
}

const TABLE = "manifold_comments";
// the Highlight API paints ranges without touching the DOM React owns
const canPaint = typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";

const paraOf = (node: Node | null): HTMLElement | null => {
  const el = node instanceof Element ? node : node?.parentElement;
  return el?.closest<HTMLElement>("[data-para]") ?? null;
};

// how many characters of the paragraph's text come before this point
const offsetIn = (para: HTMLElement, node: Node, offset: number) => {
  const r = document.createRange();
  r.selectNodeContents(para);
  r.setEnd(node, offset);
  return r.toString().length;
};

// the reverse: a Range covering [start, end) of the paragraph's text
const rangeIn = (para: HTMLElement, start: number, end: number): Range | null => {
  const walker = document.createTreeWalker(para, NodeFilter.SHOW_TEXT);
  const r = document.createRange();
  let seen = 0, started = false;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const len = n.textContent?.length ?? 0;
    if (!started && start <= seen + len) {
      r.setStart(n, Math.max(0, start - seen));
      started = true;
    }
    if (started && end <= seen + len) {
      r.setEnd(n, Math.max(0, end - seen));
      return r;
    }
    seen += len;
  }
  return null;
};

// where a comment's quote sits in the paragraph as it reads today (nearest match to where it was)
const locate = (text: string, c: Pick<Comment, "quote" | "start_offset">): [number, number] | null => {
  let best = -1;
  for (let i = text.indexOf(c.quote); i !== -1; i = text.indexOf(c.quote, i + 1)) {
    if (best === -1 || Math.abs(i - c.start_offset) < Math.abs(best - c.start_offset)) best = i;
  }
  return best === -1 ? null : [best, best + c.quote.length];
};

const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

interface Props {
  on: boolean;
  onExit: () => void;
  /** the element holding the commentable paragraphs */
  textRef: RefObject<HTMLElement>;
}

export const ManifoldPeerReview = ({ on, onExit, textRef }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("poi-reviewer") ?? "";
    } catch {
      return "";
    }
  });
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  // load once, when the page opens: the tinted passages show whether or not review mode is on
  useEffect(() => {
    if (status !== "idle") return;
    setStatus("loading");
    supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) return setStatus("error");
        setComments((data ?? []) as Comment[]);
        setStatus("ready");
      });
  }, [status]);

  // leaving review mode closes the comment being written and the list; an open thread stays
  useEffect(() => {
    if (on) return;
    setDraft(null);
    setListOpen(false);
  }, [on]);

  // review mode marks the text so the tints can be drawn stronger
  useEffect(() => {
    const root = textRef.current;
    if (!root || !on) return;
    root.classList.add("ppr-on");
    return () => root.classList.remove("ppr-on");
  }, [on, textRef]);

  // tint the commented passages, the one being written about, and the one being read
  const activeIds = useMemo(() => new Set(thread?.ids ?? []), [thread]);
  useEffect(() => {
    if (!canPaint) return;
    const root = textRef.current;
    const clear = () => ["ppr-comment", "ppr-active", "ppr-draft"].forEach((k) => CSS.highlights.delete(k));
    if (!root) return clear();
    const plain: Range[] = [], active: Range[] = [];
    for (const c of comments) {
      const para = root.querySelector<HTMLElement>(`[data-para="${CSS.escape(c.para)}"]`);
      const at = para && locate(para.textContent ?? "", c);
      const r = para && at ? rangeIn(para, at[0], at[1]) : null;
      if (r) (activeIds.has(c.id) ? active : plain).push(r);
    }
    CSS.highlights.set("ppr-comment", new Highlight(...plain));
    CSS.highlights.set("ppr-active", new Highlight(...active));
    const para = draft && root.querySelector<HTMLElement>(`[data-para="${CSS.escape(draft.para)}"]`);
    const dr = para && draft ? rangeIn(para, draft.start, draft.end) : null;
    if (dr) CSS.highlights.set("ppr-draft", new Highlight(dr));
    else CSS.highlights.delete("ppr-draft");
    return clear;
  }, [comments, draft, activeIds, textRef]);

  // a finished selection inside one paragraph opens the comment box
  const readSelection = useCallback(() => {
    const root = textRef.current;
    const sel = window.getSelection();
    if (!root || !sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const r = sel.getRangeAt(0);
    const para = paraOf(r.startContainer);
    if (!para || !root.contains(para)) return false;
    const start = offsetIn(para, r.startContainer, r.startOffset);
    // a selection that runs on into later paragraphs is cut off at the end of the first one
    const end = para.contains(r.endContainer) ? offsetIn(para, r.endContainer, r.endOffset) : (para.textContent ?? "").length;
    const text = (para.textContent ?? "").slice(start, end);
    const lead = text.length - text.trimStart().length, tail = text.length - text.trimEnd().length;
    const quote = text.trim();
    if (quote.length < 2) return false;
    const rects = r.getClientRects();
    const last = rects[rects.length - 1] ?? r.getBoundingClientRect();
    setThread(null);
    setSendError("");
    setDraft({
      para: para.dataset.para!,
      start: start + lead,
      end: end - tail,
      quote: quote.slice(0, 1200),
      x: last.left + last.width / 2 + window.scrollX,
      y: last.bottom + window.scrollY,
    });
    sel.removeAllRanges(); // the draft tint takes over from the browser's selection
    return true;
  }, [textRef]);

  useEffect(() => {
    const root = textRef.current;
    if (!root) return;
    const onUp = (e: Event) => {
      if (boxRef.current?.contains(e.target as Node)) return;
      window.setTimeout(() => {
        // selecting text only starts a comment in review mode; otherwise it is left alone, e.g. for copying
        if (on && readSelection()) return;
        if (!window.getSelection()?.isCollapsed) return;
        // a plain click on a tinted passage opens what was said about it
        if (!(e instanceof MouseEvent) || !root.contains(e.target as Node)) return;
        const para = paraOf(e.target as Node);
        const caret =
          "caretPositionFromPoint" in document
            ? document.caretPositionFromPoint(e.clientX, e.clientY)
            : null;
        const legacy = !caret && "caretRangeFromPoint" in document ? document.caretRangeFromPoint(e.clientX, e.clientY) : null;
        const node = caret?.offsetNode ?? legacy?.startContainer, off = caret?.offset ?? legacy?.startOffset ?? 0;
        if (!para || !node || !para.contains(node)) return;
        const at = offsetIn(para, node, off), text = para.textContent ?? "";
        const hits = comments.filter((c) => {
          if (c.para !== para.dataset.para) return false;
          const span = locate(text, c);
          return !!span && at >= span[0] && at <= span[1];
        });
        if (hits.length) {
          setDraft(null);
          setThread({ ids: hits.map((c) => c.id), x: e.clientX + window.scrollX, y: e.clientY + window.scrollY + 14 });
        }
      }, 10);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDraft(null);
        setThread(null);
        setListOpen(false);
      }
    };
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
      document.removeEventListener("keydown", onKey);
    };
  }, [on, comments, readSelection, textRef]);

  const post = async () => {
    if (!draft || !body.trim() || sending) return;
    setSending(true);
    setSendError("");
    const who = name.trim().slice(0, 60) || "Anonymous";
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ para: draft.para, start_offset: draft.start, quote: draft.quote, name: who, body: body.trim().slice(0, 4000) })
      .select()
      .single();
    setSending(false);
    if (error || !data) {
      setSendError("That didn't save. Please try again.");
      return;
    }
    try {
      localStorage.setItem("poi-reviewer", name.trim());
    } catch {
      /* private mode: the name just isn't remembered */
    }
    setComments((cs) => [...cs, data as Comment]);
    setBody("");
    setDraft(null);
  };

  const goTo = (c: Comment) => {
    const para = textRef.current?.querySelector<HTMLElement>(`[data-para="${CSS.escape(c.para)}"]`);
    if (!para) return;
    setListOpen(false);
    para.scrollIntoView({ block: "center", behavior: "smooth" });
    const r = para.getBoundingClientRect();
    // open its thread once the scroll has settled
    window.setTimeout(() => {
      const now = para.getBoundingClientRect();
      setThread({ ids: [c.id], x: now.left + Math.min(now.width / 2, 260) + window.scrollX, y: now.top + window.scrollY - 8 });
    }, Math.abs(r.top - window.innerHeight / 2) > 40 ? 650 : 0);
  };

  const open = draft ?? thread;
  const boxLeft = open ? Math.max(12, Math.min(open.x - 180, document.documentElement.clientWidth - 372)) : 0;
  const shown = thread ? comments.filter((c) => thread.ids.includes(c.id)) : [];
  const note =
    status === "error"
      ? "Comments could not be loaded."
      : status === "loading"
        ? "Loading comments…"
        : "Highlight any passage to comment on it.";

  return (
    <>
      <style>{CSS_TEXT}</style>

      {on && (
        <div className="ppr-bar" role="status">
          <strong>Public peer review</strong>
          <span className="ppr-bar-note">{note}</span>
          <button type="button" className="ppr-btn" onClick={() => setListOpen(true)} disabled={status !== "ready"}>
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </button>
          <button type="button" className="ppr-btn" onClick={onExit}>
            Exit
          </button>
        </div>
      )}

      {open && (
        <div ref={boxRef} className="ppr-box" style={{ left: boxLeft, top: open.y + 10 }} role="dialog" aria-label={draft ? "Add a comment" : "Comments on this passage"}>
          {draft ? (
            <>
              <blockquote>{draft.quote.length > 220 ? `${draft.quote.slice(0, 220)}…` : draft.quote}</blockquote>
              <input
                type="text"
                value={name}
                maxLength={60}
                placeholder="Your name (optional)"
                aria-label="Your name (optional)"
                onChange={(e) => setName(e.target.value)}
              />
              <textarea
                value={body}
                maxLength={4000}
                rows={4}
                placeholder="Your comment"
                aria-label="Your comment"
                autoFocus
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) post();
                }}
              />
              {sendError && <p className="ppr-error">{sendError}</p>}
              <div className="ppr-actions">
                <span>Comments are public.</span>
                <button type="button" className="ppr-btn" onClick={() => setDraft(null)}>
                  Cancel
                </button>
                <button type="button" className="ppr-btn ppr-primary" onClick={post} disabled={!body.trim() || sending}>
                  {sending ? "Posting…" : "Post"}
                </button>
              </div>
            </>
          ) : (
            <>
              {shown.map((c) => (
                <article key={c.id} className="ppr-comment">
                  <header>
                    <b>{c.name}</b> <time dateTime={c.created_at}>{when(c.created_at)}</time>
                  </header>
                  <p>{c.body}</p>
                </article>
              ))}
              <div className="ppr-actions">
                <button type="button" className="ppr-btn" onClick={() => setThread(null)}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className={`poi-scrim${listOpen ? " is-open" : ""}`} onClick={() => setListOpen(false)} aria-hidden="true" />
      <aside className={`poi-drawer${listOpen ? " is-open" : ""}`} aria-label="Peer review comments" aria-hidden={!listOpen}>
        <div className="poi-drawer-head">
          <h2>Peer review</h2>
          <button type="button" className="ppr-btn" onClick={() => setListOpen(false)} tabIndex={listOpen ? 0 : -1}>
            close ✕
          </button>
        </div>
        {comments.length === 0 && <p className="ppr-empty">No comments yet. Highlight a passage to leave the first one.</p>}
        {[...comments].reverse().map((c) => {
          const para = textRef.current?.querySelector<HTMLElement>(`[data-para="${CSS.escape(c.para)}"]`);
          const found = !!para && !!locate(para.textContent ?? "", c);
          return (
            <article key={c.id} className="ppr-comment ppr-listed">
              <blockquote>{c.quote.length > 160 ? `${c.quote.slice(0, 160)}…` : c.quote}</blockquote>
              <header>
                <b>{c.name}</b> <time dateTime={c.created_at}>{when(c.created_at)}</time>
              </header>
              <p>{c.body}</p>
              {found ? (
                <button type="button" className="ppr-link" onClick={() => goTo(c)} tabIndex={listOpen ? 0 : -1}>
                  Show in text
                </button>
              ) : (
                <span className="ppr-gone">This passage has since been edited.</span>
              )}
            </article>
          );
        })}
      </aside>
    </>
  );
};

const CSS_TEXT = `
::highlight(ppr-comment) { background-color: rgba(95,178,255,.26); }
::highlight(ppr-active) { background-color: rgba(95,178,255,.6); color: #fff; }
::highlight(ppr-draft) { background-color: rgba(235,242,250,.32); color: #fff; }

/* review mode: the commented passages stand out much more */
.ppr-on ::highlight(ppr-comment) {
  background-color: rgba(95,178,255,.5); color: #fff;
  text-decoration: underline 2px #8ccaff; text-underline-offset: 3px;
}
.ppr-on ::highlight(ppr-active) {
  background-color: #8ccaff; color: #06121f;
  text-decoration: underline 2px #fff; text-underline-offset: 3px;
}
.ppr-on ::highlight(ppr-draft) { background-color: rgba(235,242,250,.5); color: #fff; }

.ppr-bar {
  position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 6;
  display: flex; align-items: center; flex-wrap: wrap; justify-content: center; gap: 8px 14px;
  max-width: calc(100vw - 24px); padding: 10px 12px 10px 18px;
  background: linear-gradient(180deg, #232a31, #0e1114); border: 1px solid var(--edge); border-radius: 9px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.16), 0 10px 30px rgba(0,0,0,.8);
  font: 400 15px/1.3 'Newsreader', Georgia, serif; color: var(--ink);
}
.ppr-bar strong { font: 700 10px/1 'Syncopate', sans-serif; letter-spacing: .22em; text-transform: uppercase; color: var(--glow); }
.ppr-bar-note { font-style: italic; }

.ppr-btn {
  appearance: none; cursor: pointer; padding: 8px 12px 7px; border-radius: 6px;
  border: 1px solid var(--edge); background: linear-gradient(180deg, #2f373f, #171b20);
  font: 400 9px/1 'Syncopate', sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #dfe6ee;
  transition: border-color .2s, color .2s;
}
.ppr-btn:hover:not(:disabled), .ppr-btn:focus-visible { border-color: var(--glow); color: #fff; outline: none; }
.ppr-btn:disabled { opacity: .45; cursor: default; }
.ppr-primary { background: linear-gradient(180deg, #f2f5f8, #9aa5b1); color: #0a0d11; border-color: #dfe6ee; font-weight: 700; }
.ppr-primary:hover:not(:disabled), .ppr-primary:focus-visible { color: #000; }

.ppr-box {
  position: absolute; z-index: 7; width: 360px; max-width: calc(100vw - 24px); padding: 14px;
  background: linear-gradient(180deg, #1d2329, #0c0f12); border: 1px solid var(--edge); border-radius: 9px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 18px 44px rgba(0,0,0,.85);
  font: 400 16px/1.45 'Newsreader', Georgia, serif; color: var(--ink); text-align: left;
}
.ppr-box blockquote, .ppr-listed blockquote {
  margin: 0 0 12px; padding-left: 11px; border-left: 2px solid var(--glow);
  font-style: italic; font-size: 14.5px; line-height: 1.4; color: var(--ink-dim);
}
.ppr-box input, .ppr-box textarea {
  display: block; width: 100%; box-sizing: border-box; margin: 0 0 9px; padding: 9px 10px;
  background: #06080a; border: 1px solid #39414a; border-radius: 6px; color: #e9eef3;
  font: 400 16px/1.4 'Newsreader', Georgia, serif; resize: vertical;
}
.ppr-box input:focus, .ppr-box textarea:focus { outline: none; border-color: var(--glow); }
.ppr-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.ppr-actions span { margin-right: auto; font-size: 13px; font-style: italic; color: var(--ink-dim); }
.ppr-error { margin: 0 0 9px; font-size: 14px; color: #ff9b9b; }

.ppr-comment { margin: 0 0 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(90,99,109,.35); }
.ppr-comment header { font-size: 13.5px; color: var(--ink-dim); margin-bottom: 4px; }
.ppr-comment header b { font-weight: 500; color: #e9eef3; }
.ppr-comment p { margin: 0; font-size: 16px; line-height: 1.5; color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere; }
.ppr-listed { margin-bottom: 20px; }
.ppr-link {
  appearance: none; background: none; border: 0; padding: 0; margin-top: 8px; cursor: pointer;
  font: 400 9px/1 'Syncopate', sans-serif; letter-spacing: .2em; text-transform: uppercase; color: var(--glow);
}
.ppr-link:hover, .ppr-link:focus-visible { color: #fff; outline: none; }
.ppr-gone { display: block; margin-top: 8px; font-size: 13px; font-style: italic; color: var(--ink-faint); }
.ppr-empty { font-size: 16px; font-style: italic; color: var(--ink-dim); }
`;
