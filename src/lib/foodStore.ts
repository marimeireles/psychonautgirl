// Storage for the /food page.
// Everything is one kind of row; in the cloud they live in the Supabase table
// `food_rows` (see supabase-food-schema.sql). Rows are private: the table's
// row-level security only returns rows whose owner_key equals the `x-food-key`
// request header, which is the SHA-256 of the secret word typed on the page.
// Until the table exists (or when offline) rows are kept in localStorage and
// uploaded the next time the cloud is reachable.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type RowKind = "entry" | "check" | "item" | "weight" | "settings" | "exercise";

export interface FoodRow<T = unknown> {
  id: string;
  kind: RowKind;
  day: string | null; // YYYY-MM-DD
  data: T;
  created_at: string;
}

export interface FoodStore {
  mode: "cloud" | "local";
  // why we are local: the table is not created yet, or the request failed
  localReason?: "missing" | "offline";
  rows: FoodRow[];
  insert(row: FoodRow): Promise<void>;
  update(id: string, data: unknown): Promise<void>;
  remove(id: string): Promise<void>;
}

const TABLE = "food_rows";
const LOCAL_KEY = "food_rows_local";
const COLS = "id,kind,day,data,created_at";

export const sha256Hex = async (s: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const readLocal = (): FoodRow[] => {
  try {
    const v = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const writeLocal = (rows: FoodRow[]) => localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));

const isMissingTable = (error: { code?: string; message?: string } | null) =>
  !!error && (error.code === "42P01" || error.code === "PGRST205" || /relation .* does not exist|Could not find the table/i.test(error.message ?? ""));

const localStore = (reason: "missing" | "offline"): FoodStore => ({
  mode: "local",
  localReason: reason,
  rows: readLocal(),
  async insert(row) {
    writeLocal([...readLocal(), row]);
  },
  async update(id, data) {
    writeLocal(readLocal().map((r) => (r.id === id ? { ...r, data } : r)));
  },
  async remove(id) {
    writeLocal(readLocal().filter((r) => r.id !== id));
  },
});

const fetchAll = async (client: SupabaseClient): Promise<FoodRow[]> => {
  const out: FoodRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client.from(TABLE).select(COLS).order("created_at").range(from, from + 999);
    if (error) throw error;
    out.push(...((data ?? []) as FoodRow[]));
    if (!data || data.length < 1000) break;
  }
  return out;
};

export const openStore = async (ownerKey: string): Promise<FoodStore> => {
  const client = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
    // own storageKey so this client does not clash with the site-wide one in lib/supabase.ts
    auth: { persistSession: false, autoRefreshToken: false, storageKey: "food-diary-auth" },
    global: { headers: { "x-food-key": ownerKey } },
  });

  let rows: FoodRow[];
  try {
    rows = await fetchAll(client);
  } catch (e) {
    return localStore(isMissingTable(e as { code?: string; message?: string }) ? "missing" : "offline");
  }

  // upload anything saved locally while the cloud was unavailable
  const pending = readLocal();
  if (pending.length > 0) {
    const { error } = await client.from(TABLE).upsert(pending.map((r) => ({ ...r, owner_key: ownerKey })));
    if (!error) {
      writeLocal([]);
      const seen = new Set(rows.map((r) => r.id));
      rows = [...rows, ...pending.filter((r) => !seen.has(r.id))];
    }
  }

  const check = (error: unknown) => {
    if (error) throw error;
  };
  return {
    mode: "cloud",
    rows,
    async insert(row) {
      check((await client.from(TABLE).insert([{ ...row, owner_key: ownerKey }])).error);
    },
    async update(id, data) {
      check((await client.from(TABLE).update({ data }).eq("id", id)).error);
    },
    async remove(id) {
      check((await client.from(TABLE).delete().eq("id", id)).error);
    },
  };
};
