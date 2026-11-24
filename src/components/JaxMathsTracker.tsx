import { useMemo, useState } from "react";
import { Check, ExternalLink, Sigma } from "lucide-react";
import { jaxSections, jaxKey, type JaxItem, type JaxKind } from "@/data/jaxMaths";
import { useItemNotes } from "@/lib/itemNotes";
import ItemNote from "@/components/ItemNote";

// Crossable JAX + maths-for-AI tracker. Progress lives in localStorage.
// Double-click an item to write a note about it (synced to item_notes).

const KIND_LABEL: Record<JaxKind, string> = { jax: "jax", build: "build", maths: "maths", notebook: "notebook" };
const isDone = (id: string) => localStorage.getItem(jaxKey(id)) === "1";

export default function JaxMathsTracker({ onProgress }: { onProgress: () => void }) {
  const [, setTick] = useState(0);
  const [hideDone, setHideDone] = useState(false);
  const [keyOnly, setKeyOnly] = useState(false);
  const { notes, setNote, sync } = useItemNotes("jax");
  const [editing, setEditing] = useState<string | null>(null);

  const toggle = (item: JaxItem) => {
    if (isDone(item.id)) localStorage.removeItem(jaxKey(item.id));
    else localStorage.setItem(jaxKey(item.id), "1");
    setTick((t) => t + 1);
    onProgress();
  };

  const all = useMemo(() => jaxSections.flatMap((s) => s.items), []);
  const done = all.filter((i) => isDone(i.id)).length;
  const keyTotal = all.filter((i) => i.key).length;
  const keyDone = all.filter((i) => i.key && isDone(i.id)).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="bubble p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="font-bold text-lg text-[color:var(--ink)]">
            <Sigma size={18} className="inline -mt-1 mr-1" />
            jax &amp; maths for AI
          </div>
          <div className="text-xs text-[color:var(--muted)]">
            {done}/{all.length} learned · {keyDone}/{keyTotal} key · {Object.keys(notes).length} notes
            <span className="ml-1 opacity-70" title="double-click an item to write a note">
              ({sync === "synced" ? "synced" : sync === "saving" ? "saving…" : sync === "loading" ? "loading…" : "local only"})
            </span>
          </div>
        </div>
        <button className={`pill px-3 py-1 text-xs font-bold text-[color:var(--ink)] ${keyOnly ? "on" : ""}`} onClick={() => setKeyOnly((k) => !k)}>
          {keyOnly ? "showing key only" : "key only"}
        </button>
        <button className={`pill px-3 py-1 text-xs font-bold text-[color:var(--ink)] ${hideDone ? "on" : ""}`} onClick={() => setHideDone((h) => !h)}>
          {hideDone ? "showing unlearned" : "hide learned"}
        </button>
      </div>

      {jaxSections.map((s) => {
        const items = s.items.filter((i) => (!keyOnly || i.key) && !(hideDone && isDone(i.id)));
        if (!items.length) return null;
        const sectionDone = s.items.filter((i) => isDone(i.id)).length;
        return (
          <div key={s.id} className="bubble p-4">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h2 className="font-bold text-[color:var(--ink)]">{s.name}</h2>
              <span className="text-[11px] font-bold text-[color:var(--muted)]">
                {sectionDone}/{s.items.length}
              </span>
            </div>
            <ul className="grid sm:grid-cols-2 gap-2">
              {items.map((it) => {
                const d = isDone(it.id);
                return (
                  <li
                    key={it.id}
                    onDoubleClick={() => setEditing(it.id)}
                    title="double-click to add a note"
                    className={`rounded-2xl px-3 py-2 border-2 ${d ? "border-[#e9fbf2] bg-[#f3fdf8]" : "border-[color:var(--line)] bg-white"}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggle(it)}
                        title={d ? "mark unlearned" : "mark learned"}
                        className={`shrink-0 mt-0.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${
                          d ? "bg-[color:var(--ink)] border-[color:var(--ink)] text-white" : "border-[color:var(--line)] bg-white"
                        }`}
                      >
                        {d && <Check size={12} strokeWidth={3} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          {it.url ? (
                            <a href={it.url} target="_blank" rel="noreferrer" className={`font-bold text-[13px] text-[color:var(--ink)] hover:underline ${d ? "line-through opacity-70" : ""}`}>
                              {it.title}
                              <ExternalLink size={10} className="inline ml-1 -mt-0.5 opacity-60" />
                            </a>
                          ) : (
                            <span className={`font-bold text-[13px] text-[color:var(--ink)] ${d ? "line-through opacity-70" : ""}`}>{it.title}</span>
                          )}
                          {it.key && <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-[color:var(--on1)] text-[color:var(--ink)]">key</span>}
                          <span className="text-[10px] font-bold text-[color:var(--muted)]">{KIND_LABEL[it.kind]}</span>
                        </div>
                        {it.note && <p className={`text-[12px] text-[#5b4a66] mt-0.5 ${d ? "opacity-70" : ""}`}>{it.note}</p>}
                        <ItemNote
                          value={notes[it.id] ?? ""}
                          editing={editing === it.id}
                          onChange={(v) => setNote(it.id, v)}
                          onClose={() => setEditing((e) => (e === it.id ? null : e))}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
