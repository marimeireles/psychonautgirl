import { useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { supabase } from "@/lib/supabase";

// A little daemon bubble that floats over the interview-prep pages.
// Click it → half-screen markdown notes (the hackathon cheatsheet in progress).
// Click outside → back to being a bubble. Notes live in localStorage and
// sync to the daemon_notes table (supabase-daemon-schema.sql).

const NOTE_KEY = "daemon_notes";
const POS_KEY = "daemon_pos";

type Sync = "loading" | "synced" | "saving" | "local";

const BUBBLE = 60; // px

const defaultPos = () => ({
  x: Math.max(12, window.innerWidth - BUBBLE - 24),
  y: Math.max(12, window.innerHeight - BUBBLE - 96),
});

const loadPos = () => {
  try {
    const p = JSON.parse(localStorage.getItem(POS_KEY) ?? "");
    if (typeof p.x === "number" && typeof p.y === "number") return clamp(p);
  } catch { /* first visit */ }
  return defaultPos();
};

const clamp = (p: { x: number; y: number }) => ({
  x: Math.min(Math.max(4, p.x), window.innerWidth - BUBBLE - 4),
  y: Math.min(Math.max(4, p.y), window.innerHeight - BUBBLE - 4),
});

const DaemonFace = () => (
  <svg viewBox="0 0 64 64" width={BUBBLE} height={BUBBLE} aria-hidden>
    <defs>
      <linearGradient id="daemonBody" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffb7dc" />
        <stop offset="100%" stopColor="#c7a6ff" />
      </linearGradient>
    </defs>
    {/* wings */}
    <path d="M10 34 Q1 28 4 19 Q10 23 13 28 Z" fill="#e5b8f4" />
    <path d="M54 34 Q63 28 60 19 Q54 23 51 28 Z" fill="#e5b8f4" />
    {/* horns */}
    <path d="M20 14 Q17 5 24 7 Q26 11 25 15 Z" fill="#b388ff" />
    <path d="M44 14 Q47 5 40 7 Q38 11 39 15 Z" fill="#b388ff" />
    {/* body */}
    <circle cx="32" cy="34" r="23" fill="url(#daemonBody)" stroke="#a872d6" strokeWidth="2" />
    {/* tail */}
    <path d="M50 50 Q58 54 56 61 M56 61 l-4 -2 m4 2 l1 -4" stroke="#b388ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* face */}
    <circle cx="25" cy="32" r="3" fill="#4a2b5c" />
    <circle cx="39" cy="32" r="3" fill="#4a2b5c" />
    <circle cx="26" cy="31" r="1" fill="#fff" />
    <circle cx="40" cy="31" r="1" fill="#fff" />
    <path d="M27 41 Q32 45 37 41" stroke="#4a2b5c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* fangs */}
    <path d="M28.5 42.5 l1.5 3 l1.5 -2.4 Z" fill="#fff" />
    <path d="M32.5 43.2 l1.5 2.6 l1.5 -3 Z" fill="#fff" />
    {/* blush */}
    <ellipse cx="19" cy="38" rx="3.5" ry="2" fill="#ff8fc4" opacity=".55" />
    <ellipse cx="45" cy="38" rx="3.5" ry="2" fill="#ff8fc4" opacity=".55" />
  </svg>
);

export const NoteDaemon = () => {
  const [pos, setPos] = useState(loadPos);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => localStorage.getItem(NOTE_KEY) ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [sync, setSync] = useState<Sync>("loading");

  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);
  const dirty = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // pull the note from supabase once; local edits made before it lands win
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase.from("daemon_notes").select("content").eq("id", 1).maybeSingle();
        if (!alive) return;
        if (error) { setSync("local"); return; }
        if (data && !dirty.current) {
          setText(data.content);
          localStorage.setItem(NOTE_KEY, data.content);
        }
        setSync("synced");
      } catch {
        if (alive) setSync("local");
      }
    })();
    return () => { alive = false; };
  }, []);

  // keep the bubble on screen when the window resizes
  useEffect(() => {
    const onResize = () => setPos((p) => clamp(p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // open panel: click outside (or Esc) tucks it back into the bubble
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const save = (v: string) => {
    setText(v);
    dirty.current = true;
    localStorage.setItem(NOTE_KEY, v);
    if (sync !== "local") setSync("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("daemon_notes")
          .upsert({ id: 1, content: v, updated_at: new Date().toISOString() });
        setSync(error ? "local" : "synced");
      } catch {
        setSync("local");
      }
    }, 800);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const next = clamp({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy });
    if (!drag.current.moved && Math.hypot(next.x - pos.x, next.y - pos.y) < 5) return;
    drag.current.moved = true;
    setPos(next);
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    if (drag.current.moved) {
      localStorage.setItem(POS_KEY, JSON.stringify(pos));
    } else {
      setTab(text.trim() ? "preview" : "write");
      setOpen(true);
    }
    drag.current = null;
  };

  const syncLabel = sync === "saving" ? "saving…" : sync === "synced" ? "synced ✨" : "";

  return (
    <div style={{ fontFamily: "'Quicksand', 'Nunito', system-ui, sans-serif" }}>
      <style>{`
        @keyframes daemon-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes daemon-slide { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {!open && (
        <div
          role="button"
          aria-label="daemon notes"
          title="daemon notes ✦ drag me around, click to open"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="fixed z-[9990] cursor-grab active:cursor-grabbing select-none touch-none"
          style={{ left: pos.x, top: pos.y, width: BUBBLE, height: BUBBLE }}
        >
          <div
            className="transition-transform hover:scale-110"
            style={{
              animation: "daemon-bob 2.6s ease-in-out infinite",
              filter: "drop-shadow(0 6px 10px rgba(179, 136, 255, 0.45))",
            }}
          >
            <DaemonFace />
          </div>
        </div>
      )}

      {open && (
        <div
          ref={panelRef}
          className="fixed inset-y-0 right-0 z-[9991] w-full sm:w-1/2 flex flex-col"
          style={{
            background: "linear-gradient(180deg, #fff6fb 0%, #f6f0ff 100%)",
            borderLeft: "2px solid #f3cde3",
            boxShadow: "-12px 0 32px rgba(214, 150, 190, 0.25)",
            animation: "daemon-slide .18s ease-out",
          }}
        >
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <div className="scale-[.55] origin-left -mr-3"><DaemonFace /></div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#a0306b] leading-tight">daemon notes</div>
            </div>
            <div className="flex rounded-full border-2 border-[#f3cde3] bg-white overflow-hidden text-xs font-bold">
              {(["write", "preview"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 ${tab === t ? "bg-gradient-to-r from-[#ffd3e8] to-[#e5d4ff] text-[#a0306b]" : "text-[#8a6d99]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tab === "write" ? (
            <textarea
              autoFocus
              value={text}
              onChange={(e) => save(e.target.value)}
              spellCheck={false}
              className="flex-1 mx-4 mb-2 rounded-2xl border-2 border-[#f3cde3] bg-white/80 p-3 text-[13px] leading-relaxed text-[#4a2b5c] outline-none resize-none"
              style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
            />
          ) : (
            <div className="flex-1 mx-4 mb-2 rounded-2xl border-2 border-[#f3cde3] bg-white/80 p-4 overflow-y-auto">
              <MarkdownRenderer content={text} />
            </div>
          )}

          <div className="px-4 pb-3 text-[11px] font-bold text-[#8a6d99] flex items-center justify-between">
            <span>{syncLabel}</span>
            <span>click outside (or esc) to tuck me away</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteDaemon;
