import { useMemo, useState } from "react";
import { BookOpen, Check, ExternalLink } from "lucide-react";
import { readingSections, readKey, type Priority, type ReadItem } from "@/data/deepmindReading";
import { useItemNotes } from "@/lib/itemNotes";
import ItemNote from "@/components/ItemNote";

// Crossable reading list for the DeepMind interview. Progress lives in
// localStorage (same approach as the Anthropic problems on this page).
// Double-click an item to write a note about it (synced to item_notes).

const PRIORITY_LABEL: Record<Priority, string> = { core: "core", next: "next", optional: "optional" };
const PRIORITY_CLASS: Record<Priority, string> = {
  core: "bg-[color:var(--on1)] text-[color:var(--ink)]",
  next: "bg-[color:var(--on2)] text-[color:var(--ink)]",
  optional: "bg-white border border-[color:var(--line)] text-[color:var(--muted)]",
};

const isRead = (id: string) => localStorage.getItem(readKey(id)) === "1";

export default function DeepMindReadingList({ onProgress }: { onProgress: () => void }) {
  const [, setTick] = useState(0);
  const [hideRead, setHideRead] = useState(false);
  const [filter, setFilter] = useState<Priority | "all">("all");
  const { notes, setNote, sync } = useItemNotes("deepmind");
  const [editing, setEditing] = useState<string | null>(null);

  const toggle = (item: ReadItem) => {
    if (isRead(item.id)) localStorage.removeItem(readKey(item.id));
    else localStorage.setItem(readKey(item.id), "1");
    setTick((t) => t + 1);
    onProgress();
  };

  const all = useMemo(() => readingSections.flatMap((s) => s.items), []);
  const readCount = all.filter((i) => isRead(i.id)).length;
  const coreTotal = all.filter((i) => i.priority === "core").length;
  const coreRead = all.filter((i) => i.priority === "core" && isRead(i.id)).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="bubble p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="font-bold text-lg text-[color:var(--ink)]">
            <BookOpen size={18} className="inline -mt-1 mr-1" />
            multi-agent flourishing readings
          </div>
          <div className="text-xs text-[color:var(--muted)]">
            {readCount}/{all.length} read · {coreRead}/{coreTotal} core · {Object.keys(notes).length} notes
            <span className="ml-1 opacity-70" title="double-click an item to write a note">
              ({sync === "synced" ? "synced" : sync === "saving" ? "saving…" : sync === "loading" ? "loading…" : "local only"})
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {(["all", "core", "next", "optional"] as const).map((p) => (
            <button key={p} className={`pill px-3 py-1 text-xs font-bold text-[color:var(--ink)] ${filter === p ? "on" : ""}`} onClick={() => setFilter(p)}>
              {p}
            </button>
          ))}
        </div>
        <button className={`pill px-3 py-1 text-xs font-bold text-[color:var(--ink)] ${hideRead ? "on" : ""}`} onClick={() => setHideRead((h) => !h)}>
          {hideRead ? "showing unread" : "hide read"}
        </button>
      </div>

      {readingSections.map((s) => {
        const items = s.items.filter((i) => (filter === "all" || i.priority === filter) && !(hideRead && isRead(i.id)));
        if (!items.length) return null;
        const done = s.items.filter((i) => isRead(i.id)).length;
        return (
          <div key={s.id} className="bubble p-4">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h2 className="font-bold text-[color:var(--ink)]">{s.name}</h2>
              <span className="text-[11px] font-bold text-[color:var(--muted)]">
                {done}/{s.items.length}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {items.map((it) => {
                const read = isRead(it.id);
                return (
                  <li
                    key={it.id}
                    onDoubleClick={() => setEditing(it.id)}
                    title="double-click to add a note"
                    className={`rounded-2xl px-3 py-2.5 border-2 ${read ? "border-[#e9fbf2] bg-[#f3fdf8]" : "border-[color:var(--line)] bg-white"}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggle(it)}
                        title={read ? "mark unread" : "mark read"}
                        className={`shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${
                          read ? "bg-[color:var(--ink)] border-[color:var(--ink)] text-white" : "border-[color:var(--line)] bg-white"
                        }`}
                      >
                        {read && <Check size={13} strokeWidth={3} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <a
                            href={it.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`font-bold text-[13.5px] text-[color:var(--ink)] hover:underline ${read ? "line-through opacity-70" : ""}`}
                          >
                            {it.title}
                            <ExternalLink size={11} className="inline ml-1 -mt-0.5 opacity-60" />
                          </a>
                          <span className={`tag text-[10px] font-bold rounded-full px-2 py-0.5 ${PRIORITY_CLASS[it.priority]}`}>{PRIORITY_LABEL[it.priority]}</span>
                        </div>
                        <div className="text-[11.5px] text-[color:var(--muted)] mt-0.5">
                          {it.by} · {it.year} · {it.kind} · {it.time}
                        </div>
                        <p className={`text-[12.5px] text-[#5b4a66] mt-1 ${read ? "opacity-70" : ""}`}>{it.why}</p>
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
