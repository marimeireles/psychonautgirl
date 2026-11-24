import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

// Per-item notes for the checklists on /interview (double-click an item to write one).
// Notes live in localStorage straight away and sync to the item_notes table
// (supabase-reading-notes-schema.sql). Until that table exists, localStorage only.

export type NotesSync = "loading" | "synced" | "saving" | "local";
type NoteMap = Record<string, string>;

const storageKey = (list: string) => `item_notes_${list}`;

const loadLocal = (list: string): NoteMap => {
  try {
    const raw = localStorage.getItem(storageKey(list));
    return raw ? (JSON.parse(raw) as NoteMap) : {};
  } catch {
    return {};
  }
};

export function useItemNotes(list: string) {
  const [notes, setNotes] = useState<NoteMap>(() => loadLocal(list));
  const [sync, setSync] = useState<NotesSync>("loading");
  const dirty = useRef<Set<string>>(new Set()); // ids edited locally before the remote copy landed
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // pull every note for this list once; local edits made in the meantime win
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase.from("item_notes").select("item_id, body").eq("list", list);
        if (!alive) return;
        if (error) {
          setSync("local");
          return;
        }
        setNotes((cur) => {
          const next = { ...cur };
          for (const row of data ?? []) {
            if (!dirty.current.has(row.item_id)) {
              if (row.body) next[row.item_id] = row.body;
              else delete next[row.item_id];
            }
          }
          localStorage.setItem(storageKey(list), JSON.stringify(next));
          return next;
        });
        setSync("synced");
      } catch {
        if (alive) setSync("local");
      }
    })();
    return () => {
      alive = false;
    };
  }, [list]);

  const setNote = useCallback(
    (id: string, body: string) => {
      dirty.current.add(id);
      setNotes((cur) => {
        const next = { ...cur };
        if (body.trim()) next[id] = body;
        else delete next[id];
        localStorage.setItem(storageKey(list), JSON.stringify(next));
        return next;
      });
      setSync((s) => (s === "local" ? s : "saving"));
      clearTimeout(timers.current[id]);
      timers.current[id] = setTimeout(async () => {
        try {
          const { error } = body.trim()
            ? await supabase.from("item_notes").upsert({ list, item_id: id, body, updated_at: new Date().toISOString() })
            : await supabase.from("item_notes").delete().eq("list", list).eq("item_id", id);
          setSync(error ? "local" : "synced");
        } catch {
          setSync("local");
        }
      }, 800);
    },
    [list],
  );

  return { notes, setNote, sync };
}
