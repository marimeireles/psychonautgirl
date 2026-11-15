import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Search, Settings, X } from "lucide-react";
import { NUTRIENTS_VERSION, nutrients, nutrientGroups, fmtAmount, hasAminos, type NutrientGroup, type Per100 } from "@/data/nutrients";
import { estimateAminos, fetchNutrients, parseQuery, searchFoods, usingDemoKey, type FoodHit } from "@/lib/foodApi";
import { matchMyFoods, myFoods } from "@/data/myFoods";
import { ACTIVITIES, EXERCISE, MAX_PACE_KG, MIND_KCAL, computeEnergy, type ExerciseLevel, type Profile } from "@/data/energy";
import { openStore, sha256Hex, type FoodRow, type FoodStore, type RowKind } from "@/lib/foodStore";

// ---------- row payloads ----------
interface EntryData {
  name: string;
  grams: number;
  per100: Per100;
  fdcId?: number;
  // amino acids were worked out from the dish's ingredients rather than measured
  aminoEst?: boolean;
  // typed in by hand as a whole portion: grams are meaningless, kcal is per100.kcal
  manual?: boolean;
  // NUTRIENTS_VERSION the per100 values were fetched under; older ones get the newer nutrients filled in
  nv?: number;
}
// placeholder used only for the maths while the "about you" form is still unanswered; never shown
const BLANK_PROFILE: Profile = { sex: "female", age: 30, heightCm: 165, startKg: 60, goalKg: 60, activity: "light", paceKg: 0.3 };

// the day's modifiers, kept in one "exercise" row per day
interface DayMods {
  level?: ExerciseLevel;
  mind?: boolean; // a day of intense intellectual work
}

type Totals = Record<string, number>;

// ---------- dates (local time, YYYY-MM-DD) ----------
const dayStr = (d: Date) => d.toLocaleDateString("en-CA");
const parseDay = (s: string) => new Date(`${s}T12:00:00`);
const addDays = (s: string, n: number) => {
  const d = parseDay(s);
  d.setDate(d.getDate() + n);
  return dayStr(d);
};
const prettyDay = (s: string, today: string) => {
  if (s === today) return "today";
  if (s === addDays(today, -1)) return "yesterday";
  return parseDay(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).toLowerCase();
};

// ---------- maths ----------
const totalsOf = (entries: FoodRow<EntryData>[]): Totals => {
  const t: Totals = {};
  for (const e of entries) {
    for (const [k, v] of Object.entries(e.data.per100)) t[k] = (t[k] ?? 0) + (v * e.data.grams) / 100;
  }
  return t;
};

// a day counts as "goal reached" from 95% so a near miss doesn't break a streak
const GOAL_RATIO = 0.95;
const plantFor = (ratio: number) => (ratio <= 0 ? "🌰" : ratio < 0.35 ? "🌱" : ratio < 0.7 ? "🌿" : ratio < GOAL_RATIO ? "🪴" : "🌳");
const plantWord = (ratio: number) =>
  ratio <= 0 ? "a seed, waiting" : ratio < 0.35 ? "sprouting" : ratio < 0.7 ? "growing leaves" : ratio < GOAL_RATIO ? "almost a tree" : "a whole tree";

const KEY_STORAGE = "food_key";
const newId = () => crypto.randomUUID();

const PageStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');
    .food { font-family: 'Quicksand', 'Nunito', system-ui, sans-serif; color: #4a3b2a; }
    .food.meadow { background: linear-gradient(180deg, #f6f1df 0%, #e7efd6 50%, #f0e4d0 100%); }
    .food .bubble {
      background: #fffdf5;
      border: 2px solid #d5dbb8;
      border-radius: 28px;
      box-shadow: 0 6px 0 #dfe3c3, 0 10px 24px rgba(120, 110, 60, 0.14);
    }
    .food .bubble.bark { border-color: #dcc3a2; box-shadow: 0 6px 0 #e8d6bb, 0 10px 24px rgba(127, 85, 57, 0.14); }
    .food .pill {
      border-radius: 999px;
      border: 2px solid #d5dbb8;
      background: #fffdf5;
      box-shadow: 0 3px 0 #dfe3c3;
      transition: transform .08s ease, box-shadow .08s ease;
    }
    .food .pill:hover { transform: translateY(-1px); }
    .food .pill:active { transform: translateY(2px); box-shadow: 0 1px 0 #dfe3c3; }
    .food .pill.on { background: linear-gradient(135deg, #d9e8b4, #f0dfc0); border-color: #a3b973; }
    .food .pill.go { background: linear-gradient(135deg, #8fb35a, #6a994e); border-color: #5d8a44; color: #fff; box-shadow: 0 3px 0 #4f7639; }
    .food .pill:disabled { opacity: .55; cursor: default; transform: none; }
    .food .bar { border-radius: 999px; background: #eef0dc; overflow: hidden; height: 10px; }
    .food .bar > div { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #b5cf7a, #6a994e); transition: width .3s ease; }
    .food .bar.full > div { background: linear-gradient(90deg, #6a994e, #386641); }
    .food .bar.limit > div { background: linear-gradient(90deg, #d9b98f, #a9795a); }
    .food .bar.over > div { background: linear-gradient(90deg, #d9a05b, #bc6c25); }
    .food .check {
      width: 24px; height: 24px; border-radius: 999px; border: 2px solid #a3b973; background: #fffdf5; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; color: #fff;
      transition: transform .1s ease, background .15s ease;
    }
    .food .check:hover { transform: scale(1.1); }
    .food .check.on { background: linear-gradient(135deg, #8fb35a, #386641); border-color: #5d8a44; }
    .food select { border-radius: 16px; border: 2px solid #d5dbb8; background: #fffef8; padding: 8px 14px; outline: none; color: #4a3b2a; font-weight: 600; }
    .food select:focus { border-color: #a3b973; box-shadow: 0 0 0 4px #e9f0d2; }
    .food input {
      border-radius: 16px; border: 2px solid #d5dbb8; background: #fffef8; padding: 8px 14px; outline: none; color: #4a3b2a; min-width: 0;
    }
    .food input:focus { border-color: #a3b973; box-shadow: 0 0 0 4px #e9f0d2; }
    .food input::placeholder { color: #b3a78f; }
    .food .soft { color: #8a7a62; }
    .food .leaf { color: #386641; }
    .food .barkc { color: #7f5539; }
    .food .row { border-radius: 18px; background: #f7f5e6; border: 2px solid #e6e8cf; }
    .food .cell { border-radius: 16px; border: 2px solid #e6e8cf; background: #f7f5e6; transition: transform .08s ease; }
    .food .cell:hover { transform: translateY(-1px); }
    .food .cell.sel { border-color: #7f5539; }
    .food button:focus-visible, .food input:focus-visible { outline: 2px solid #386641; outline-offset: 2px; }
    .food .daemon { animation: daemon-bob 2.6s ease-in-out infinite; transform-origin: 50% 100%; }
    .food .daemon .sprout { animation: daemon-sway 3.2s ease-in-out infinite; transform-origin: 32px 20px; }
    .food .daemon .blink { animation: daemon-blink 4.5s infinite; transform-origin: 32px 40px; }
    .food .daemon.hop { animation: daemon-hop .6s ease; }
    .food .report { width: 100%; border-radius: 16px; border: 2px solid #e6e8cf; background: #f7f5e6; padding: 10px 12px; font: 11px/1.45 ui-monospace, Menlo, monospace; color: #4a3b2a; resize: vertical; outline: none; }
    @keyframes daemon-bob { 0%, 100% { transform: translateY(0) scale(1, 1); } 50% { transform: translateY(-3px) scale(1.02, .98); } }
    @keyframes daemon-sway { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(7deg); } }
    @keyframes daemon-blink { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(.1); } }
    @keyframes daemon-hop { 0% { transform: translateY(0) scale(1, 1); } 30% { transform: translateY(-14px) scale(.94, 1.08); } 60% { transform: translateY(0) scale(1.1, .9); } 100% { transform: translateY(0) scale(1, 1); } }
    @media (prefers-reduced-motion: reduce) { .food .daemon, .food .daemon .sprout, .food .daemon .blink { animation: none; } }
  `}</style>
);

// ---------- small pieces ----------
// the plant daemon that writes the day report: a little seed spirit with a sprout on its head
const PlantDaemon = ({ hop }: { hop: boolean }) => (
  <svg viewBox="0 0 64 72" width="64" height="72" className={`daemon ${hop ? "hop" : ""}`} aria-hidden="true">
    <ellipse cx="32" cy="68" rx="15" ry="3" fill="#7f5539" opacity=".18" />
    <g className="sprout">
      <path d="M32 22 C32 16 32 13 33 9" stroke="#5d8a44" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M33 10 C25 9 20 4 21 0 C28 0 33 4 33 10 Z" fill="#8fb35a" stroke="#5d8a44" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M33 11 C40 11 45 7 45 3 C39 2 34 5 33 11 Z" fill="#b5cf7a" stroke="#5d8a44" strokeWidth="1.5" strokeLinejoin="round" />
    </g>
    <path d="M17 60 L15 65 M47 60 L49 65" stroke="#7f5539" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 20 C46 20 53 32 53 44 C53 57 44 64 32 64 C20 64 11 57 11 44 C11 32 18 20 32 20 Z" fill="#d9b98f" stroke="#7f5539" strokeWidth="2.5" />
    <path d="M22 54 C26 59 38 59 42 54" stroke="#c4a078" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M11 44 L5 40 M53 44 L59 40" stroke="#7f5539" strokeWidth="3" strokeLinecap="round" />
    <g className="blink">
      <circle cx="25" cy="40" r="3" fill="#4a3b2a" />
      <circle cx="39" cy="40" r="3" fill="#4a3b2a" />
    </g>
    <circle cx="26" cy="39" r="1" fill="#fffdf5" />
    <circle cx="40" cy="39" r="1" fill="#fffdf5" />
    <ellipse cx="20" cy="46" rx="3" ry="2" fill="#e9a98f" opacity=".7" />
    <ellipse cx="44" cy="46" rx="3" ry="2" fill="#e9a98f" opacity=".7" />
    <path d="M29 46 C30.5 48 33.5 48 35 46" stroke="#4a3b2a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
);

// `pin` (0..1 of the way round) marks the maintenance point on the ring
const Ring = ({ ratio, pin, children }: { ratio: number; pin?: number; children: React.ReactNode }) => {
  const r = 78;
  const c = 2 * Math.PI * r;
  const a = 2 * Math.PI * Math.min(1, Math.max(0, pin ?? 0));
  const px = 92 + r * Math.sin(a);
  const py = 92 - r * Math.cos(a);
  return (
    <div className="relative w-[184px] h-[184px] flex-shrink-0">
      <svg viewBox="0 0 184 184" className="w-full h-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="food-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b5cf7a" />
            <stop offset="100%" stopColor="#386641" />
          </linearGradient>
        </defs>
        <circle cx="92" cy="92" r={r} fill="none" stroke="#eef0dc" strokeWidth="16" />
        <circle
          cx="92"
          cy="92"
          r={r}
          fill="none"
          stroke="url(#food-ring)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, ratio)))}
          style={{ transition: "stroke-dashoffset .5s ease" }}
        />
      </svg>
      {pin !== undefined && (
        <svg viewBox="0 0 184 184" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <circle cx={px} cy={py} r="7" fill="#7f5539" stroke="#fffdf5" strokeWidth="3" />
        </svg>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
};

const NutrientBar = ({ label, amount, target, unit, limit }: { label: string; amount: number; target: number; unit: string; limit?: boolean }) => {
  const ratio = target > 0 ? amount / target : 0;
  const cls = limit ? (ratio > 1 ? "bar over" : "bar limit") : ratio >= 1 ? "bar full" : "bar";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs font-bold">
        <span>{label}</span>
        <span className="soft font-semibold whitespace-nowrap">
          {fmtAmount(amount, unit)} / {limit ? "max " : ""}
          {fmtAmount(target, unit)} {unit}
        </span>
      </div>
      <div className={`${cls} mt-1`}>
        <div style={{ width: `${Math.min(100, ratio * 100)}%` }} />
      </div>
    </div>
  );
};

// ---------- the page ----------
const Food = () => {
  const navigate = useNavigate();
  const today = dayStr(new Date());

  const [ownerKey, setOwnerKey] = useState<string | null>(() => localStorage.getItem(KEY_STORAGE));
  const [secret, setSecret] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [store, setStore] = useState<FoodStore | null>(null);
  const [rows, setRows] = useState<FoodRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState<"today" | "diary">("today");
  const [day, setDay] = useState(today);
  const [diaryDay, setDiaryDay] = useState(today);
  const [calMonth, setCalMonth] = useState(today.slice(0, 7)); // YYYY-MM shown in the diary calendar
  const [group, setGroup] = useState<NutrientGroup>("macros");
  const [showSettings, setShowSettings] = useState(false);

  // search
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<FoodHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<{ hit: FoodHit; grams: string } | null>(null);
  const [report, setReport] = useState("");
  const [hop, setHop] = useState(false);
  // a report describes one day as it was when generated; drop it when either changes
  useEffect(() => setReport(""), [day, rows]);
  const [manual, setManual] = useState<{ name: string; kcal: string; more: boolean; extra: Record<string, string> } | null>(null);

  const [newItem, setNewItem] = useState("");
  const [weightInput, setWeightInput] = useState("");

  const load = async (key: string) => {
    setLoading(true);
    try {
      const s = await openStore(key);
      setStore(s);
      setRows(s.rows);
      if (s.localReason === "offline") toast.error("couldn't reach the cloud, so this is saved in this browser for now");
    } catch (e) {
      console.error(e);
      toast.error(`couldn't open the diary: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ownerKey) load(ownerKey);
  }, [ownerKey]);

  const unlock = async () => {
    if (secret.trim().length < 6) {
      toast.error("use at least 6 characters");
      return;
    }
    if (!window.isSecureContext || !crypto?.subtle) {
      toast.error("the diary only opens over https; check the address starts with https://");
      return;
    }
    setUnlocking(true);
    try {
      const key = await sha256Hex(`food:${secret.trim()}`);
      localStorage.setItem(KEY_STORAGE, key);
      setSecret("");
      setOwnerKey(key);
    } catch (e) {
      console.error(e);
      toast.error(`couldn't open the diary: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setUnlocking(false);
    }
  };

  const lock = () => {
    localStorage.removeItem(KEY_STORAGE);
    setOwnerKey(null);
    setStore(null);
    setRows([]);
  };

  // optimistic write: change the screen first, then save; reload if saving fails
  const save = async (apply: (r: FoodRow[]) => FoodRow[], op: (s: FoodStore) => Promise<void>) => {
    if (!store || !ownerKey) return;
    setRows(apply);
    try {
      await op(store);
    } catch (e) {
      console.error(e);
      toast.error("couldn't save that, reloading");
      load(ownerKey);
    }
  };
  const insertRow = (kind: RowKind, rowDay: string | null, data: unknown) => {
    const row: FoodRow = { id: newId(), kind, day: rowDay, data, created_at: new Date().toISOString() };
    return save(
      (r) => [...r, row],
      (s) => s.insert(row),
    );
  };
  const updateRow = (id: string, data: unknown) =>
    save(
      (r) => r.map((x) => (x.id === id ? { ...x, data } : x)),
      (s) => s.update(id, data),
    );
  const removeRow = (id: string) =>
    save(
      (r) => r.filter((x) => x.id !== id),
      (s) => s.remove(id),
    );

  // ---------- derived ----------
  const settingsRow = rows.find((r) => r.kind === "settings") as FoodRow<Partial<Profile>> | undefined;
  // the diary needs a profile before it can work out any calories
  const hasProfile = !!settingsRow?.data.sex;
  const settings: Profile = hasProfile ? { ...BLANK_PROFILE, ...settingsRow!.data } : BLANK_PROFILE;
  const [draft, setDraft] = useState({ sex: "", age: "", heightCm: "", startKg: "", goalKg: "", activity: "light", paceKg: "0.3", kcalOverride: "" });

  const entries = useMemo(() => rows.filter((r) => r.kind === "entry") as FoodRow<EntryData>[], [rows]);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const items = useMemo(() => rows.filter((r) => r.kind === "item") as FoodRow<{ name: string }>[], [rows]);
  const checks = useMemo(() => rows.filter((r) => r.kind === "check") as FoodRow<{ item: string }>[], [rows]);
  const exerciseByDay = useMemo(() => {
    const m: Record<string, FoodRow<DayMods>> = {};
    for (const r of rows) if (r.kind === "exercise" && r.day) m[r.day] = r as FoodRow<DayMods>;
    return m;
  }, [rows]);
  const weights = useMemo(
    () => (rows.filter((r) => r.kind === "weight" && r.day) as FoodRow<{ kg: number }>[]).sort((a, b) => a.day!.localeCompare(b.day!)),
    [rows],
  );

  const entriesByDay = useMemo(() => {
    const m: Record<string, FoodRow<EntryData>[]> = {};
    for (const e of entries) if (e.day) (m[e.day] ??= []).push(e);
    return m;
  }, [entries]);
  const totalsByDay = useMemo(() => {
    const m: Record<string, Totals> = {};
    for (const [d, list] of Object.entries(entriesByDay)) m[d] = totalsOf(list);
    return m;
  }, [entriesByDay]);

  const currentKg = weights.length > 0 ? weights[weights.length - 1].data.kg : settings.startKg;
  const energy = computeEnergy(settings, currentKg);
  const exerciseOf = (d: string) => EXERCISE.find((x) => x.level === exerciseByDay[d]?.data.level);
  const exerciseKcalOf = (d: string) => {
    const x = exerciseOf(d);
    return x ? energy.exercise[x.level] : 0;
  };
  const mindOf = (d: string) => !!exerciseByDay[d]?.data.mind;
  // the goal for a given day: the base goal plus that day's modifiers
  const goalOf = (d: string) => energy.goal + exerciseKcalOf(d) + (mindOf(d) ? MIND_KCAL : 0);
  const kcalOf = (d: string) => totalsByDay[d]?.kcal ?? 0;
  const ratioOf = (d: string) => kcalOf(d) / goalOf(d);

  const streak = useMemo(() => {
    let d = ratioOf(today) >= GOAL_RATIO ? today : addDays(today, -1);
    let n = 0;
    while (ratioOf(d) >= GOAL_RATIO) {
      n++;
      d = addDays(d, -1);
    }
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalsByDay, exerciseByDay, energy.goal, currentKg, today]);

  // foods eaten before, most recent first, one per name, each with the amounts it was logged at (latest first)
  const pastFoods = useMemo(() => {
    const seen = new Map<string, { food: EntryData; amounts: number[] }>();
    for (let i = entries.length - 1; i >= 0; i--) {
      const d = entries[i].data;
      const past = seen.get(d.name);
      if (!past) seen.set(d.name, { food: d, amounts: [d.grams] });
      else if (!d.manual && !past.amounts.includes(d.grams)) past.amounts.push(d.grams);
    }
    return [...seen.values()];
  }, [entries]);
  const parsed = parseQuery(query);
  const typed = parsed.text.length >= 2;
  const typedWords = parsed.text.toLowerCase().split(" ").filter(Boolean);
  // nothing typed: the latest few foods at their last amount; typing: the foods that match, at every amount used before
  const suggestions = (typed ? pastFoods.filter((p) => typedWords.every((w) => p.food.name.includes(w))) : pastFoods)
    .slice(0, 6)
    .flatMap((p) =>
      p.food.manual || parsed.grams !== undefined
        ? [{ ...p.food, grams: p.food.manual ? p.food.grams : parsed.grams! }]
        : p.amounts.slice(0, typed ? 4 : 1).map((grams) => ({ ...p.food, grams })),
    );

  // hand-kept foods (src/data/myFoods.ts) that match what is typed; they get negative ids so they never clash with USDA ones
  const mine: FoodHit[] =
    parsed.text.length >= 2
      ? matchMyFoods(parsed.text).map((f) => ({
          fdcId: -(myFoods.indexOf(f) + 1),
          name: f.name,
          source: "mine",
          per100: f.per100,
          portions: f.portions ?? [],
          defaultGrams: f.defaultGrams ?? 100,
          note: f.note,
        }))
      : [];

  // Dishes come from the food database without amino acids; fill them in from the
  // ingredients, for new entries and for ones logged before this existed.
  const aminoTried = useRef(new Set<number>());
  useEffect(() => {
    const todo = new Map<number, number>();
    for (const e of entries) {
      const { fdcId, per100, manual } = e.data;
      if (!fdcId || manual || hasAminos(per100) || !(per100.protein > 0) || aminoTried.current.has(fdcId)) continue;
      todo.set(fdcId, per100.protein);
    }
    if (todo.size === 0) return;
    for (const id of todo.keys()) aminoTried.current.add(id);
    (async () => {
      for (const [fdcId, protein] of todo) {
        try {
          const aminos = await estimateAminos(fdcId, protein);
          if (!aminos || !hasAminos(aminos)) continue;
          for (const e of entriesRef.current) {
            if (e.data.fdcId === fdcId && !hasAminos(e.data.per100)) updateRow(e.id, { ...e.data, per100: { ...e.data.per100, ...aminos }, aminoEst: true });
          }
        } catch {
          break; // offline or rate limited: the rest get another go next visit
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  // Entries logged before omega-3 and iodine were tracked: fetch those for them once.
  const nutrientsTried = useRef(new Set<number>());
  useEffect(() => {
    const ids = new Set<number>();
    for (const e of entries) {
      const { fdcId, manual, nv } = e.data;
      if (fdcId && fdcId > 0 && !manual && (nv ?? 1) < NUTRIENTS_VERSION && !nutrientsTried.current.has(fdcId)) ids.add(fdcId);
    }
    if (ids.size === 0) return;
    for (const id of ids) nutrientsTried.current.add(id);
    (async () => {
      try {
        const found = await fetchNutrients([...ids], ["omega3", "ala", "iodine"]);
        for (const e of entriesRef.current) {
          const { fdcId, nv } = e.data;
          if (!fdcId || !(fdcId in found) || (nv ?? 1) >= NUTRIENTS_VERSION) continue;
          updateRow(e.id, { ...e.data, per100: { ...e.data.per100, ...found[fdcId] }, nv: NUTRIENTS_VERSION });
        }
      } catch {
        /* offline or rate limited: they get another go next visit */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  // ---------- actions ----------
  const addEntry = (data: EntryData, toDay = day) => {
    const before = kcalOf(toDay);
    const added = ((data.per100.kcal ?? 0) * data.grams) / 100;
    insertRow("entry", toDay, data);
    const goal = goalOf(toDay) * GOAL_RATIO;
    if (before < goal && before + added >= goal) toast.success("goal reached, your tree is fully grown 🌳");
    else toast(`added ${data.name} (${Math.round(added)} kcal)`);
  };

  const runSearch = async () => {
    if (!parsed.text) return;
    setSearching(true);
    setPicked(null);
    setManual(null);
    try {
      setHits([...mine, ...(await searchFoods(parsed.text))]);
    } catch (e) {
      setHits(mine.length > 0 ? mine : null);
      toast.error(e instanceof Error ? e.message : "search failed");
    } finally {
      setSearching(false);
    }
  };

  const pick = (hit: FoodHit) => {
    const grams = parsed.grams ?? (parsed.count ? parsed.count * hit.defaultGrams : hit.defaultGrams);
    setPicked({ hit, grams: String(Math.round(grams)) });
  };

  const confirmPick = () => {
    if (!picked) return;
    const grams = parseFloat(picked.grams);
    if (!(grams > 0)) {
      toast.error("how many grams?");
      return;
    }
    addEntry({ name: picked.hit.name, grams, per100: picked.hit.per100, fdcId: picked.hit.fdcId > 0 ? picked.hit.fdcId : undefined, nv: NUTRIENTS_VERSION });
    setPicked(null);
    setHits(null);
    setQuery("");
  };

  const confirmManual = () => {
    if (!manual) return;
    const kcal = parseFloat(manual.kcal);
    const name = manual.name.trim().toLowerCase();
    if (!name || !(kcal >= 0)) {
      toast.error("give it a name and calories");
      return;
    }
    // stored as a 100 g portion so the maths stays the same
    const per100: Per100 = { kcal };
    for (const [k, v] of Object.entries(manual.extra)) {
      const n = parseFloat(v.replace(",", "."));
      if (n >= 0) per100[k] = n;
    }
    addEntry({ name, grams: 100, per100, manual: true });
    setManual(null);
    setQuery("");
  };

  const checkedToday = new Set(checks.filter((c) => c.day === day).map((c) => c.data.item));
  const toggleCheck = (name: string) => {
    const existing = checks.find((c) => c.day === day && c.data.item === name);
    if (existing) removeRow(existing.id);
    else insertRow("check", day, { item: name });
  };
  const addItem = () => {
    const name = newItem.trim();
    if (!name) return;
    if (items.some((i) => i.data.name.toLowerCase() === name.toLowerCase())) {
      toast.error("already on the list");
      return;
    }
    insertRow("item", null, { name });
    setNewItem("");
  };

  const saveWeight = () => {
    const kg = parseFloat(weightInput.replace(",", "."));
    if (!(kg > 20 && kg < 300)) {
      toast.error("type your weight in kg");
      return;
    }
    const existing = weights.find((w) => w.day === day);
    if (existing) updateRow(existing.id, { kg });
    else insertRow("weight", day, { kg });
    setWeightInput("");
  };

  const openSettings = () => {
    setDraft({
      sex: settings.sex,
      age: String(settings.age),
      heightCm: String(settings.heightCm),
      startKg: String(settings.startKg),
      goalKg: String(settings.goalKg),
      activity: settings.activity,
      paceKg: String(settings.paceKg),
      kcalOverride: settings.kcalOverride ? String(settings.kcalOverride) : "",
    });
    setShowSettings((v) => !v);
  };
  // the form's text turned into a profile, or null while something is missing or out of range
  const draftProfile = (): Profile | null => {
    const num = (v: string) => parseFloat(v.replace(",", "."));
    const p: Profile = {
      sex: draft.sex === "male" ? "male" : "female",
      age: num(draft.age),
      heightCm: num(draft.heightCm),
      startKg: num(draft.startKg),
      goalKg: num(draft.goalKg),
      activity: (ACTIVITIES.find((a) => a.id === draft.activity)?.id ?? "light"),
      paceKg: num(draft.paceKg),
      kcalOverride: draft.kcalOverride.trim() ? num(draft.kcalOverride) : null,
    };
    const ok =
      (draft.sex === "female" || draft.sex === "male") &&
      p.age >= 14 && p.age <= 110 &&
      p.heightCm >= 120 && p.heightCm <= 230 &&
      p.startKg >= 25 && p.startKg <= 300 &&
      p.goalKg >= 25 && p.goalKg <= 300 &&
      p.paceKg >= 0 && p.paceKg <= MAX_PACE_KG &&
      (p.kcalOverride === null || p.kcalOverride! >= 800);
    return ok ? p : null;
  };
  const saveSettings = () => {
    const next = draftProfile();
    if (!next) {
      toast.error(`fill in every box (pace is 0 to ${MAX_PACE_KG} kg a week)`);
      return;
    }
    if (settingsRow) updateRow(settingsRow.id, next);
    else insertRow("settings", null, next);
    setShowSettings(false);
  };

  // ---------- gate ----------
  if (!ownerKey) {
    return (
      <div className="food meadow min-h-screen flex flex-col items-center justify-center gap-5 p-4">
        <PageStyle />
        <div className="bubble p-7 w-full max-w-sm text-center space-y-4">
          <div className="text-5xl">🌱</div>
          <h1 className="text-2xl font-bold leaf">food diary</h1>
          <p className="text-sm soft">
            Pick a secret word the first time. The same word opens the same diary on any device, and anyone who knows it can read it.
          </p>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            placeholder="secret word"
            aria-label="secret word"
            className="w-full text-center"
            autoFocus
          />
          <button onClick={unlock} disabled={unlocking} className="pill go px-6 py-2 font-bold w-full">
            {unlocking ? "opening…" : "open my diary"}
          </button>
          <button onClick={() => navigate("/")} className="text-xs soft underline">
            back to the desktop
          </button>
        </div>
        <div className="bubble bark p-5 w-full max-w-sm text-sm" role="note">
          <span className="font-bold barkc">A heads-up 🍂 </span>
          This data is unencrypted and saved on my Supabase account. Please don't share anything you wouldn't want a robot scraping the web to
          find. On my end, rest assured I will never read this data.
        </div>
      </div>
    );
  }

  // ---------- pieces shared by both views ----------
  const dayEntries = entriesByDay[day] ?? [];
  const totals = totalsByDay[day] ?? {};
  const kcal = totals.kcal ?? 0;
  const dayGoal = goalOf(day);
  const dayExercise = exerciseOf(day);
  const ctx = { kg: currentKg, kcalGoal: dayGoal, sex: settings.sex, age: settings.age };
  const ratio = kcal / dayGoal;
  const left = Math.max(0, Math.round(dayGoal - kcal));
  // exercise is burnt on top of maintenance, so the pin moves with it
  const dayMaintenance = energy.maintenance + exerciseKcalOf(day);
  const atMaintenance = kcal >= dayMaintenance;
  const setMods = (next: DayMods) => {
    const existing = exerciseByDay[day];
    const data: DayMods = { ...(next.level ? { level: next.level } : {}), ...(next.mind ? { mind: true } : {}) };
    if (!existing) insertRow("exercise", day, data);
    else if (!data.level && !data.mind) removeRow(existing.id);
    else updateRow(existing.id, data);
  };
  const dayMind = mindOf(day);
  const setExercise = (level: ExerciseLevel) => setMods({ level: dayExercise?.level === level ? undefined : level, mind: dayMind });
  const toggleMind = () => setMods({ level: dayExercise?.level, mind: !dayMind });
  const aminoCount = dayEntries.filter((e) => hasAminos(e.data.per100)).length;
  const aminoEstCount = dayEntries.filter((e) => e.data.aminoEst).length;
  const weightSpan = settings.goalKg - settings.startKg;
  const weightRatio = weightSpan !== 0 ? Math.min(1, Math.max(0, (currentKg - settings.startKg) / weightSpan)) : 0;
  const dayWeight = weights.find((w) => w.day === day);

  const hero = (
    <div className="bubble p-5 flex flex-col sm:flex-row items-center gap-5">
      <Ring ratio={ratio} pin={dayMaintenance / dayGoal}>
        <div className="text-5xl leading-none">{plantFor(ratio)}</div>
        <div className="text-xl font-bold leaf mt-1">{Math.round(kcal)}</div>
        <div className="text-[11px] soft font-bold">of {dayGoal} kcal</div>
      </Ring>
      <div className="flex-1 w-full space-y-3">
        <div>
          <div className="text-lg font-bold leaf">
            {ratio >= GOAL_RATIO ? "goal reached 🌳" : kcal === 0 ? "plant today's seed" : `${left} kcal to go`}
          </div>
          <div className="text-sm soft">
            {prettyDay(day, today)}'s plant is {plantWord(ratio)}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className={`pill px-3 py-1 ${atMaintenance ? "on" : ""}`}>
            <span className="inline-block w-2.5 h-2.5 rounded-full align-middle mr-1" style={{ background: "#7f5539" }} aria-hidden="true" />
            {atMaintenance ? `maintenance reached (${dayMaintenance})` : `${Math.round(dayMaintenance - kcal)} kcal to maintenance (${dayMaintenance})`}
          </span>
          <span className="pill px-3 py-1">🍄 {streak} day streak</span>
          <span className="pill px-3 py-1">🥚 {Math.round(totals.protein ?? 0)} g protein</span>
          <span className="pill px-3 py-1">🍽️ {dayEntries.length} logged</span>
        </div>
        <div>
          <div className="flex justify-between text-xs font-bold barkc">
            <span>{settings.startKg} kg</span>
            <span>now {fmtAmount(currentKg, "kg")} kg</span>
            <span>{settings.goalKg} kg 🏡</span>
          </div>
          <div className="relative mt-1">
            <div className="bar limit">
              <div style={{ width: `${weightRatio * 100}%` }} />
            </div>
            <span className="absolute -top-2 text-base" style={{ left: `calc(${weightRatio * 100}% - 10px)` }} aria-hidden="true">
              🐌
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const searchCard = (
    <div className="bubble p-5 space-y-3">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          aria-label="search for a food"
          className="flex-1 font-semibold"
        />
        <button onClick={runSearch} disabled={searching || !parsed.text} className="pill go px-4 py-2 font-bold flex items-center gap-1 text-sm">
          <Search className="w-4 h-4" />
          {searching ? "looking…" : "search"}
        </button>
      </div>

      {mine.length > 0 && !hits && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs soft font-bold">my foods:</span>
          {mine.map((h) => (
            <button
              key={h.fdcId}
              onClick={() => {
                setManual(null);
                setHits([h]);
                pick(h);
              }}
              className="pill on px-3 py-1 text-xs font-bold"
            >
              {h.name} <span className="soft">{Math.round(h.per100.kcal)} kcal/100g</span>
            </button>
          ))}
        </div>
      )}

      {suggestions.length > 0 && !hits && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs soft font-bold">eaten before:</span>
          {suggestions.map((f) => (
            <button key={`${f.name}|${f.grams}`} onClick={() => addEntry(f)} className="pill px-3 py-1 text-xs font-bold">
              + {f.name} <span className="soft">{f.manual ? `${Math.round(f.per100.kcal ?? 0)} kcal` : `${fmtAmount(f.grams, "g")} g`}</span>
            </button>
          ))}
        </div>
      )}

      {hits && (
        <div className="space-y-2">
          {hits.length === 0 && <div className="text-sm soft">nothing found for "{parsed.text}". try fewer words, or add it by hand.</div>}
          {hits.map((h) => {
            const open = picked?.hit.fdcId === h.fdcId;
            const grams = open ? parseFloat(picked!.grams) || 0 : 0;
            return (
              <div key={h.fdcId} className="row p-3">
                <button onClick={() => (open ? setPicked(null) : pick(h))} className="w-full flex items-center justify-between gap-3 text-left">
                  <span className="text-sm font-bold">{h.name}</span>
                  <span className="flex items-center gap-2 flex-shrink-0 text-xs">
                    {hasAminos(h.per100) && <span className="soft font-bold">aminos ✓</span>}
                    <span className="soft font-bold">{h.source}</span>
                    <span className="font-bold leaf">{Math.round(h.per100.kcal)} kcal/100g</span>
                  </span>
                </button>
                {open && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={picked!.grams}
                      onChange={(e) => setPicked({ hit: h, grams: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && confirmPick()}
                      aria-label="grams"
                      className="w-24 font-bold"
                      autoFocus
                    />
                    <span className="text-sm font-bold">g</span>
                    {h.portions.map((p) => (
                      <button key={p.label} onClick={() => setPicked({ hit: h, grams: String(Math.round(p.grams)) })} className="pill px-3 py-1 text-xs font-bold">
                        {p.label} · {Math.round(p.grams)} g
                      </button>
                    ))}
                    <span className="text-sm font-bold leaf ml-auto">{Math.round((h.per100.kcal * grams) / 100)} kcal</span>
                    <button onClick={confirmPick} className="pill go px-4 py-1.5 text-sm font-bold">
                      add
                    </button>
                    {h.note && <p className="w-full text-xs soft">{h.note}</p>}
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={() => setHits(null)} className="text-xs soft underline">
            close results
          </button>
        </div>
      )}

      {manual ? (
        <div className="flex flex-wrap items-center gap-2">
          <input value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} placeholder="what was it" aria-label="food name" className="flex-1" />
          <input
            type="number"
            inputMode="decimal"
            value={manual.kcal}
            onChange={(e) => setManual({ ...manual, kcal: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && confirmManual()}
            placeholder="kcal"
            aria-label="calories"
            className="w-24"
          />
          <button onClick={confirmManual} className="pill go px-4 py-1.5 text-sm font-bold">
            add
          </button>
          <button onClick={() => setManual(null)} className="text-xs soft underline">
            cancel
          </button>
          <button onClick={() => setManual({ ...manual, more: !manual.more })} className="text-xs soft underline" aria-expanded={manual.more}>
            {manual.more ? "fewer details" : "more details"}
          </button>
          {manual.more && (
            <div className="w-full space-y-3 pt-1">
              <div className="text-xs soft">Amounts for the whole portion you ate. Leave blank anything you don't know.</div>
              {nutrientGroups.map((g) => (
                <div key={g.id}>
                  <div className="text-xs font-bold barkc mb-1.5">{g.title}</div>
                  <div className="grid gap-x-4 gap-y-1.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {nutrients
                      .filter((n) => n.group === g.id && n.key !== "kcal")
                      .map((n) => (
                        <label key={n.key} className="flex items-center gap-2 text-xs font-bold">
                          <span className="flex-1 min-w-0">{n.label}</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            value={manual.extra[n.key] ?? ""}
                            onChange={(e) => setManual({ ...manual, extra: { ...manual.extra, [n.key]: e.target.value } })}
                            className="w-20 text-sm"
                          />
                          <span className="soft w-7">{n.unit}</span>
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => setManual({ name: parsed.text, kcal: "", more: false, extra: {} })} className="text-xs soft underline">
          add by hand
        </button>
      )}

      {usingDemoKey && (
        <div className="text-xs soft">The food search is on a shared demo key (about 10 searches an hour). Add VITE_FDC_API_KEY to .env to lift that.</div>
      )}
    </div>
  );

  const entryList = (
    <div className="bubble p-5">
      <h2 className="text-base font-bold leaf mb-3">eaten {prettyDay(day, today)}</h2>
      {dayEntries.length === 0 ? (
        <div className="text-sm soft">Nothing logged yet. Search for a food above to add it.</div>
      ) : (
        <ul className="space-y-2">
          {dayEntries.map((e) => (
            <li key={e.id} className="row px-3 py-2 flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
              <span className="basis-full sm:basis-0 sm:flex-1 text-sm font-bold min-w-0 break-words">{e.data.name}</span>
              {!e.data.manual && (
                <>
                  <input
                    type="number"
                    inputMode="decimal"
                    defaultValue={e.data.grams}
                    key={e.data.grams}
                    onBlur={(ev) => {
                      const g = parseFloat(ev.target.value);
                      if (g > 0 && g !== e.data.grams) updateRow(e.id, { ...e.data, grams: g });
                      else ev.target.value = String(e.data.grams);
                    }}
                    onKeyDown={(ev) => ev.key === "Enter" && (ev.target as HTMLInputElement).blur()}
                    aria-label={`grams of ${e.data.name}`}
                    className="w-20 text-sm font-bold !py-1 !px-2 text-right"
                  />
                  <span className="text-xs soft font-bold">g</span>
                </>
              )}
              <span className="text-sm font-bold leaf w-20 text-right">{Math.round(((e.data.per100.kcal ?? 0) * e.data.grams) / 100)} kcal</span>
              <button onClick={() => removeRow(e.id)} aria-label={`remove ${e.data.name}`} className="soft hover:text-[#bc6c25]">
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const nutrientCard = (
    <div className="bubble p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {nutrientGroups.map((g) => (
          <button key={g.id} onClick={() => setGroup(g.id)} className={`pill px-3 py-1 text-xs font-bold ${group === g.id ? "on" : ""}`}>
            {g.title}
          </button>
        ))}
      </div>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {nutrients
          .filter((n) => n.group === group)
          .map((n) => (
            <NutrientBar key={n.key} label={n.label} amount={totals[n.key] ?? 0} target={n.target(ctx)} unit={n.unit} limit={n.limit} />
          ))}
      </div>
      <div className="text-xs soft mt-4">
        {group === "aminos"
          ? `${aminoCount < dayEntries.length ? `Amino acid data exists for ${aminoCount} of ${dayEntries.length} foods logged this day, so these bars can read low. ` : ""}${aminoEstCount > 0 ? `For ${aminoEstCount} mixed ${aminoEstCount === 1 ? "dish" : "dishes"} the amounts are estimated from the ingredients. ` : ""}Targets are WHO adult needs for ${fmtAmount(currentKg, "kg")} kg.`
          : group === "macros"
            ? `Omega-3 DHA + EPA is the kind in oily fish and algae (250 mg a day); ALA is the plant kind.`
            : `Targets are daily reference intakes for ${settings.sex === "male" ? "a man" : "a woman"} aged ${settings.age}. Supplements you tick off are not counted here.${group === "minerals" ? " The food database has iodine for only a few foods, so that bar reads low." : ""}`}
      </div>
    </div>
  );

  const medsBox = (
    <div className="bubble bark p-5">
      <h2 className="text-base font-bold barkc mb-1">vitamins &amp; meds 💊</h2>
      <div className="text-xs soft mb-3">ticked ones are saved in {prettyDay(day, today)}'s diary</div>
      <ul className="space-y-2">
        {items.map((it) => {
          const on = checkedToday.has(it.data.name);
          return (
            <li key={it.id} className="flex items-center gap-2 group">
              <button onClick={() => toggleCheck(it.data.name)} className={`check ${on ? "on" : ""}`} role="checkbox" aria-checked={on} aria-label={it.data.name}>
                {on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </button>
              <span className={`flex-1 text-sm font-bold min-w-0 break-words ${on ? "line-through soft" : ""}`}>{it.data.name}</span>
              <button
                onClick={() => removeRow(it.id)}
                aria-label={`remove ${it.data.name} from the list`}
                className="soft opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-[#bc6c25]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2 mt-3">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="add one… vitamin d"
          aria-label="add a vitamin or medicine"
          className="flex-1 text-sm"
        />
        <button onClick={addItem} className="pill px-3 py-1 text-sm font-bold" aria-label="add to the list">
          +
        </button>
      </div>
    </div>
  );

  const exerciseBox = (
    <div className="bubble bark p-5">
      <h2 className="text-base font-bold barkc mb-3">modifiers ✨</h2>
      <ul className="space-y-2">
        {EXERCISE.map((x) => {
          const on = dayExercise?.level === x.level;
          return (
            <li key={x.level} className="flex items-center gap-2">
              <button onClick={() => setExercise(x.level)} className={`check ${on ? "on" : ""}`} role="checkbox" aria-checked={on} aria-label={`${x.label} exercise`}>
                {on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </button>
              <span className="flex-1 min-w-0 text-sm font-bold">{x.label} exercise</span>
              <span className="text-xs font-bold leaf whitespace-nowrap">+{energy.exercise[x.level]} kcal</span>
            </li>
          );
        })}
        <li className="flex items-center gap-2">
          <button onClick={toggleMind} className={`check ${dayMind ? "on" : ""}`} role="checkbox" aria-checked={dayMind} aria-label="intense intellectual day">
            {dayMind && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
          </button>
          <span className="flex-1 min-w-0 text-sm font-bold">intense intellectual day</span>
          <span className="text-xs font-bold leaf whitespace-nowrap">+{MIND_KCAL} kcal</span>
        </li>
      </ul>
    </div>
  );

  const weightBox = (
    <div className="bubble bark p-5">
      <h2 className="text-base font-bold barkc mb-1">weigh-in 🐌</h2>
      <div className="text-xs soft mb-3">
        {dayWeight ? `${fmtAmount(dayWeight.data.kg, "kg")} kg logged ${prettyDay(day, today)}` : `nothing logged ${prettyDay(day, today)}`}
        {" · "}
        {fmtAmount(Math.abs(settings.goalKg - currentKg), "kg")} kg to go
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveWeight()}
          placeholder="kg"
          aria-label="weight in kg"
          className="flex-1 text-sm"
        />
        <button onClick={saveWeight} className="pill px-3 py-1 text-sm font-bold">
          save
        </button>
      </div>
    </div>
  );

  // ---------- day report ----------
  // plain text with everything logged for the day, made to be pasted into a chat with a language model
  const buildReport = () => {
    const L: string[] = [];
    const amt = (v: number, unit: string) => `${fmtAmount(v, unit)} ${unit}`;
    L.push(`Food diary report for ${parseDay(day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`);
    L.push("");
    L.push("About me");
    L.push(`- ${settings.sex}, ${settings.age} years, ${settings.heightCm} cm, ${ACTIVITIES.find((a) => a.id === settings.activity)?.label ?? settings.activity} on an ordinary day`);
    L.push(`- weight ${amt(currentKg, "kg")}${dayWeight ? " (weighed this day)" : " (latest weigh-in)"}, goal ${amt(settings.goalKg, "kg")}`);
    L.push("");
    L.push("Energy");
    L.push(`- eaten ${Math.round(kcal)} kcal of a ${dayGoal} kcal goal (${Math.round(ratio * 100)}%)`);
    L.push(`- maintenance ${dayMaintenance} kcal, resting ${energy.resting} kcal`);
    const mods = [dayExercise && `${dayExercise.label} exercise (+${energy.exercise[dayExercise.level]} kcal)`, dayMind && `intense intellectual day (+${MIND_KCAL} kcal)`].filter(Boolean);
    L.push(`- modifiers: ${mods.length > 0 ? mods.join(", ") : "none"}`);
    L.push("");
    L.push(`Foods (${dayEntries.length})`);
    if (dayEntries.length === 0) L.push("- nothing logged");
    for (const e of dayEntries) {
      const k = Math.round(((e.data.per100.kcal ?? 0) * e.data.grams) / 100);
      L.push(e.data.manual ? `- ${e.data.name}: ${k} kcal (typed in by hand)` : `- ${e.data.name}: ${Math.round(e.data.grams)} g, ${k} kcal`);
    }
    for (const g of nutrientGroups) {
      L.push("");
      L.push(`${g.title[0].toUpperCase()}${g.title.slice(1)} (amount / daily target)`);
      for (const n of nutrients.filter((x) => x.group === g.id)) {
        const v = totals[n.key] ?? 0;
        const t = n.target(ctx);
        L.push(`- ${n.label}: ${fmtAmount(v, n.unit)} / ${amt(t, n.unit)} (${t > 0 ? Math.round((v / t) * 100) : 0}%${n.limit ? ", upper limit" : ""})`);
      }
    }
    L.push("");
    L.push("Supplements and meds");
    if (items.length === 0) L.push("- none on my list");
    for (const it of items) L.push(`- ${it.data.name}: ${checkedToday.has(it.data.name) ? "taken" : "not taken"}`);
    L.push("");
    L.push("Notes");
    L.push("- Nutrient amounts come from food only; supplements are not counted in them.");
    const byHand = dayEntries.filter((e) => e.data.manual).length;
    if (byHand > 0) L.push(`- ${byHand} of the foods ${byHand === 1 ? "was" : "were"} typed in by hand and may be missing vitamins, minerals and amino acids, so those totals can read low.`);
    if (aminoCount < dayEntries.length) L.push(`- Amino acid data exists for ${aminoCount} of ${dayEntries.length} foods.`);
    if (aminoEstCount > 0) L.push(`- Amino acids for ${aminoEstCount} mixed ${aminoEstCount === 1 ? "dish are" : "dishes are"} estimated from ingredients.`);
    L.push("- Food values are from USDA FoodData Central; vitamin and mineral targets are US reference intakes, amino acid targets are WHO adult needs per kg.");
    return L.join("\n");
  };
  const makeReport = async () => {
    const text = buildReport();
    setReport(text);
    setHop(true);
    setTimeout(() => setHop(false), 650);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("day report copied, paste it anywhere 🌱");
    } catch {
      toast("day report ready below, copy it from the box");
    }
  };
  const reportBox = (
    <div className="bubble bark p-5">
      <div className="flex items-end gap-3">
        <PlantDaemon hop={hop} />
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold barkc">day report</h2>
          <div className="text-xs soft mb-2">everything from {prettyDay(day, today)} as text, ready to paste</div>
          <button onClick={makeReport} className="pill go px-4 py-1.5 text-sm font-bold">
            {report ? "copy again" : "generate"}
          </button>
        </div>
      </div>
      {report && <textarea readOnly value={report} rows={8} aria-label="day report text" className="report mt-3" onFocus={(e) => e.currentTarget.select()} />}
    </div>
  );

  // ---------- diary ----------
  const diary = () => {
    // one real calendar month, Monday first; null = blank cell before the 1st
    const [calY, calM] = calMonth.split("-").map(Number);
    const first = `${calMonth}-01`;
    const daysInMonth = new Date(calY, calM, 0).getDate();
    const lead = (parseDay(first).getDay() + 6) % 7;
    const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i))];
    const shiftMonth = (n: number) => {
      const d = new Date(calY, calM - 1 + n, 1, 12);
      setCalMonth(dayStr(d).slice(0, 7));
    };
    const monthName = parseDay(first).toLocaleDateString("en-GB", { month: "long", year: "numeric" }).toLowerCase();
    const monthDays = cells.filter((d): d is string => !!d && d <= today);
    const monthGoalDays = monthDays.filter((d) => ratioOf(d) >= GOAL_RATIO).length;
    const monthLogged = monthDays.filter((d) => kcalOf(d) > 0).length;
    const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, -i)).filter((d) => kcalOf(d) > 0);
    const last30 = Array.from({ length: 30 }, (_, i) => addDays(today, -i));
    const avg = (key: string) => (last7.length ? last7.reduce((s, d) => s + (totalsByDay[d]?.[key] ?? 0), 0) / last7.length : 0);
    const goalDays = last30.filter((d) => ratioOf(d) >= GOAL_RATIO).length;

    const sel = diaryDay;
    const selEntries = entriesByDay[sel] ?? [];
    const selChecks = checks.filter((c) => c.day === sel);
    const selWeight = weights.find((w) => w.day === sel);

    const kgs = weights.map((w) => w.data.kg);
    const lo = Math.min(settings.startKg, settings.goalKg, ...kgs) - 0.5;
    const hi = Math.max(settings.startKg, settings.goalKg, ...kgs) + 0.5;
    const X = (i: number) => (weights.length > 1 ? 10 + (i * 280) / (weights.length - 1) : 150);
    const Y = (kg: number) => 90 - ((kg - lo) / (hi - lo)) * 80;

    return (
      <div className="grid gap-5 lg:grid-cols-[1fr_340px] items-start">
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { v: `${streak}`, l: "day streak 🍄" },
              { v: `${Math.round(avg("kcal"))}`, l: "avg kcal, last 7 days" },
              { v: `${goalDays}/30`, l: "days at goal 🌳" },
              { v: `${Math.round(avg("protein"))} g`, l: "avg protein" },
            ].map((s) => (
              <div key={s.l} className="bubble p-4 text-center">
                <div className="text-2xl font-bold leaf">{s.v}</div>
                <div className="text-[11px] soft font-bold">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="bubble p-5">
            <div className="flex items-center justify-between gap-3 mb-1">
              <button onClick={() => shiftMonth(-1)} className="pill p-2" aria-label="previous month">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-bold leaf">{monthName}</h2>
              <button onClick={() => shiftMonth(1)} disabled={calMonth >= today.slice(0, 7)} className="pill p-2" aria-label="next month">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs soft font-bold text-center mb-3">
              {monthLogged} {monthLogged === 1 ? "day" : "days"} logged · {monthGoalDays} at goal 🌳
              {calMonth !== today.slice(0, 7) && (
                <button onClick={() => setCalMonth(today.slice(0, 7))} className="underline ml-2">
                  this month
                </button>
              )}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => (
                <div key={d} className="text-[10px] soft font-bold">
                  {d}
                </div>
              ))}
              {cells.map((d, i) => {
                if (!d) return <div key={`blank-${i}`} />;
                const future = d > today;
                const r = ratioOf(d);
                return (
                  <button
                    key={d}
                    disabled={future}
                    onClick={() => setDiaryDay(d)}
                    className={`cell py-2 ${sel === d ? "sel" : ""} ${future ? "opacity-30" : ""}`}
                    aria-current={d === today ? "date" : undefined}
                    style={!future && r > 0 ? { background: `rgba(106, 153, 78, ${0.12 + 0.4 * Math.min(1, r)})` } : undefined}
                    aria-label={`${prettyDay(d, today)}: ${Math.round(kcalOf(d))} kcal`}
                  >
                    <div className={`text-[10px] font-bold ${d === today ? "leaf underline" : "soft"}`}>{parseDay(d).getDate()}</div>
                    <div className="text-xl leading-tight">{future || r <= 0 ? <span className="soft">·</span> : plantFor(r)}</div>
                    <div className="text-[10px] font-bold">{future || kcalOf(d) === 0 ? " " : Math.round(kcalOf(d))}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bubble bark p-5">
            <h2 className="text-base font-bold barkc mb-2">
              weight, {settings.startKg} → {settings.goalKg} kg
            </h2>
            {weights.length === 0 ? (
              <div className="text-sm soft">No weigh-ins yet. Log one from the log tab.</div>
            ) : (
              <svg viewBox="0 0 300 100" className="w-full h-32" role="img" aria-label={`weight history, latest ${fmtAmount(currentKg, "kg")} kg`}>
                <line x1="10" x2="290" y1={Y(settings.goalKg)} y2={Y(settings.goalKg)} stroke="#6a994e" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="290" y={Y(settings.goalKg) - 4} textAnchor="end" fontSize="8" fontWeight="700" fill="#386641">
                  goal {settings.goalKg} kg
                </text>
                {weights.length > 1 && (
                  <polyline points={weights.map((w, i) => `${X(i)},${Y(w.data.kg)}`).join(" ")} fill="none" stroke="#7f5539" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                )}
                {weights.map((w, i) => (
                  <circle key={w.id} cx={X(i)} cy={Y(w.data.kg)} r="3.5" fill="#fffdf5" stroke="#7f5539" strokeWidth="2">
                    <title>{`${prettyDay(w.day!, today)}: ${w.data.kg} kg`}</title>
                  </circle>
                ))}
                <text x={X(weights.length - 1)} y={Y(currentKg) - 8} textAnchor={weights.length > 1 ? "end" : "middle"} fontSize="9" fontWeight="700" fill="#7f5539">
                  {fmtAmount(currentKg, "kg")} kg
                </text>
              </svg>
            )}
          </div>
        </div>

        <div className="bubble p-5 lg:sticky lg:top-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold leaf">
              {plantFor(ratioOf(sel))} {prettyDay(sel, today)}
            </h2>
            <button
              onClick={() => {
                setDay(sel);
                setView("today");
              }}
              className="pill px-3 py-1 text-xs font-bold"
            >
              edit this day
            </button>
          </div>
          <div className="text-sm font-bold mt-1">
            {Math.round(kcalOf(sel))} / {goalOf(sel)} kcal
            <span className="soft"> · {Math.round(totalsByDay[sel]?.protein ?? 0)} g protein</span>
            {selWeight && <span className="soft"> · {selWeight.data.kg} kg</span>}
            {exerciseOf(sel) && <span className="soft"> · 🥾 {exerciseOf(sel)!.label} exercise</span>}
            {mindOf(sel) && <span className="soft"> · 🧠 intense intellectual day</span>}
          </div>
          <div className={`mt-2 ${ratioOf(sel) >= 1 ? "bar full" : "bar"}`}>
            <div style={{ width: `${Math.min(100, ratioOf(sel) * 100)}%` }} />
          </div>

          <h3 className="text-xs font-bold soft mt-4 mb-1">food</h3>
          {selEntries.length === 0 ? (
            <div className="text-sm soft">nothing logged</div>
          ) : (
            <ul className="space-y-1">
              {selEntries.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 text-sm">
                  <span className="font-semibold min-w-0 truncate">
                    {e.data.name} {!e.data.manual && <span className="soft">{Math.round(e.data.grams)} g</span>}
                  </span>
                  <span className="font-bold leaf flex-shrink-0">{Math.round(((e.data.per100.kcal ?? 0) * e.data.grams) / 100)}</span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="text-xs font-bold soft mt-4 mb-1">vitamins &amp; meds taken</h3>
          {selChecks.length === 0 ? (
            <div className="text-sm soft">none ticked</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selChecks.map((c) => (
                <span key={c.id} className="pill on px-3 py-1 text-xs font-bold">
                  ✓ {c.data.item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------- render ----------
  return (
    <div className="food meadow min-h-screen">
      <PageStyle />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <header className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold leaf mr-2">food diary 🌿</h1>
          <button onClick={() => setView("today")} className={`pill px-4 py-1.5 text-sm font-bold ${view === "today" ? "on" : ""}`}>
            log
          </button>
          <button
            onClick={() => {
              setDiaryDay(day);
              setCalMonth(day.slice(0, 7));
              setView("diary");
            }}
            className={`pill px-4 py-1.5 text-sm font-bold ${view === "diary" ? "on" : ""}`}
          >
            diary
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={openSettings} className="pill p-2" aria-label="goals" aria-expanded={showSettings}>
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={lock} className="pill px-3 py-1.5 text-xs font-bold">
              lock
            </button>
            <button onClick={() => navigate("/")} className="pill px-3 py-1.5 text-xs font-bold">
              ← desktop
            </button>
          </div>
        </header>

        {store && (showSettings || !hasProfile) && (
          <div className="bubble p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold leaf">{hasProfile ? "about you" : "first, a little about you 🌱"}</h2>
              <div className="text-xs soft">
                The calorie goal, the maintenance pin, the exercise bonuses and the vitamin targets are all worked out from these, and they follow your
                weigh-ins.
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs font-bold soft flex flex-col gap-1">
                sex
                <select value={draft.sex} onChange={(e) => setDraft({ ...draft, sex: e.target.value })} className="text-sm">
                  <option value="">choose…</option>
                  <option value="female">female</option>
                  <option value="male">male</option>
                </select>
              </label>
              {(
                [
                  ["age", "age"],
                  ["heightCm", "height, cm"],
                  ["startKg", hasProfile ? "starting weight, kg" : "weight now, kg"],
                  ["goalKg", "goal weight, kg"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="text-xs font-bold soft flex flex-col gap-1">
                  {label}
                  <input type="number" inputMode="decimal" value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} className="w-28 text-sm" />
                </label>
              ))}
              <label className="text-xs font-bold soft flex flex-col gap-1">
                an ordinary day is
                <select value={draft.activity} onChange={(e) => setDraft({ ...draft, activity: e.target.value })} className="text-sm">
                  {ACTIVITIES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold soft flex flex-col gap-1">
                pace, kg a week
                <input type="number" inputMode="decimal" step="0.05" value={draft.paceKg} onChange={(e) => setDraft({ ...draft, paceKg: e.target.value })} className="w-28 text-sm" />
              </label>
              <label className="text-xs font-bold soft flex flex-col gap-1">
                own kcal goal (optional)
                <input
                  type="number"
                  inputMode="decimal"
                  value={draft.kcalOverride}
                  onChange={(e) => setDraft({ ...draft, kcalOverride: e.target.value })}
                  placeholder="calculated"
                  className="w-32 text-sm"
                />
              </label>
              <button onClick={saveSettings} className="pill go px-4 py-2 text-sm font-bold">
                {hasProfile ? "save" : "start my diary"}
              </button>
            </div>
            {(() => {
              const p = draftProfile();
              if (!p) return null;
              // the preview uses the latest weigh-in when there is one, like the page does
              const e = computeEnergy(p, weights.length > 0 ? currentKg : p.startKg);
              return (
                <div className="text-sm font-bold">
                  at rest {e.resting} kcal <span className="soft">·</span> maintenance {e.maintenance} kcal <span className="soft">·</span>{" "}
                  <span className="leaf">daily goal {e.goal} kcal</span>
                </div>
              );
            })()}
          </div>
        )}

        {!hasProfile && store ? null : loading && !store ? (
          <div className="bubble p-8 text-center text-sm soft font-bold">opening the diary…</div>
        ) : view === "today" ? (
          <>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setDay(addDays(day, -1))} className="pill p-2" aria-label="previous day">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-bold w-32 text-center">{prettyDay(day, today)}</div>
              <button onClick={() => setDay(addDays(day, 1))} disabled={day >= today} className="pill p-2" aria-label="next day">
                <ChevronRight className="w-4 h-4" />
              </button>
              {day !== today && (
                <button onClick={() => setDay(today)} className="pill px-3 py-1 text-xs font-bold">
                  back to today
                </button>
              )}
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_300px] items-start">
              <div className="space-y-5 min-w-0">
                {hero}
                {searchCard}
                {entryList}
                {nutrientCard}
              </div>
              <div className="space-y-5 lg:sticky lg:top-4">
                {medsBox}
                {exerciseBox}
                {weightBox}
                {reportBox}
              </div>
            </div>
          </>
        ) : (
          diary()
        )}
      </div>
    </div>
  );
};

export default Food;
