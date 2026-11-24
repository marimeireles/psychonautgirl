import { useEffect, useRef, useState } from "react";
import { StickyNote } from "lucide-react";

// The note area under a checklist item. Opens on double-click of the item (the parent
// toggles `editing`); saves on blur or cmd/ctrl+enter; esc cancels. When not editing
// and a note exists it shows the note read-only.

export default function ItemNote({
  value,
  editing,
  onChange,
  onClose,
}: {
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      requestAnimationFrame(() => {
        ref.current?.focus();
        ref.current?.setSelectionRange(ref.current.value.length, ref.current.value.length);
      });
    }
  }, [editing, value]);

  if (!editing) {
    if (!value) return null;
    return (
      <div className="mt-1.5 text-[12px] text-[#5b4a66] whitespace-pre-wrap rounded-xl px-2.5 py-1.5 bg-[color:var(--soft)] border border-[color:var(--line)]">
        <StickyNote size={11} className="inline -mt-0.5 mr-1 opacity-60" />
        {value}
      </div>
    );
  }

  const commit = () => {
    if (draft !== value) onChange(draft);
    onClose();
  };

  return (
    <div className="mt-1.5" onDoubleClick={(e) => e.stopPropagation()}>
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setDraft(value);
            onClose();
          } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            commit();
          }
        }}
        rows={Math.min(10, Math.max(3, draft.split("\n").length + 1))}
        placeholder="your thoughts on this one… (blur or ⌘⏎ to save, esc to cancel)"
        className="w-full text-[12.5px] text-[#5b4a66] rounded-xl px-2.5 py-2 bg-white border-2 border-[color:var(--on-line)] outline-none resize-y"
        style={{ fontFamily: "inherit" }}
      />
    </div>
  );
}
