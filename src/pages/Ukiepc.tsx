import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ExternalLink, Trash2, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { topics, kattisUrl, leetcodeUrl, type Task } from "@/data/ukiepc";
import { blind75, blind75Count, b75Key, type B75Problem } from "@/data/blind75";
import { mlSections, mlTopicCount, type MlTopic } from "@/data/mlResearcher";
import { tensorPuzzles, tensorPuzzleRules, tensorPuzzlesRepoUrl, tensorPuzzlesColabUrl, type TensorPuzzle } from "@/data/tensorPuzzles";

type View = "blind75" | "ml" | "tensors" | "log";

interface User {
  username: string;
  display_name: string;
}

interface ProgressRow {
  username: string;
  key: string;
  done: boolean;
  notes: string;
  updated_at: string;
}

interface SolveRow {
  id: number;
  username: string;
  slug: string;
  topic: string | null;
  result: string;
  minutes: number | null;
  notes: string;
  solved_at: string;
}

const USER_STORAGE_KEY = "ukiepc_user";

// one pastel per section
const dayPastels = [
  { bg: "#ffe4f1", border: "#f7b6d6" },
  { bg: "#ffeedd", border: "#f9c9a3" },
  { bg: "#fff8cf", border: "#f3e39a" },
  { bg: "#dcf8ea", border: "#a9e6c8" },
  { bg: "#def0ff", border: "#a9d3f7" },
  { bg: "#ece2ff", border: "#c9b4f5" },
  { bg: "#ffe0e6", border: "#f5aebb" },
  { bg: "#fff0f6", border: "#f7b6d6" },
];

const loadStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u && typeof u.username === "string" && typeof u.display_name === "string") return u;
  } catch {
    /* ignore */
  }
  return null;
};

const normalizeUsername = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

const isMissingTable = (error: { code?: string; message?: string } | null) =>
  !!error && (error.code === "42P01" || error.code === "PGRST205" || /relation .* does not exist|Could not find the table/i.test(error.message ?? ""));

// Task state lives in the existing columns: done=true is "done"; done=false with notes="tried" is "tried"; otherwise empty.
type TaskState = "empty" | "done" | "tried";
const stateOf = (row: ProgressRow | undefined): TaskState => (row?.done ? "done" : row?.notes === "tried" ? "tried" : "empty");
const nextState: Record<TaskState, TaskState> = { empty: "done", done: "tried", tried: "empty" };

// ML topics cycle differently: "know" is the normal marker, "refresh" the grey one
// (learned a while ago, needs a refresher). Stored as done=true with notes="refresh".
type MlState = "empty" | "know" | "refresh";
const mlStateOf = (row: ProgressRow | undefined): MlState => (row?.done ? (row.notes === "refresh" ? "refresh" : "know") : "empty");
const nextMlState: Record<MlState, MlState> = { empty: "know", know: "refresh", refresh: "empty" };

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((100 * a) / b));

const PageStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');
    .ukiepc { font-family: 'Quicksand', 'Nunito', system-ui, sans-serif; }
    .ukiepc .bubble {
      background: #fff;
      border: 2px solid #f3cde3;
      border-radius: 28px;
      box-shadow: 0 6px 0 #f3d6e7, 0 10px 24px rgba(214, 150, 190, 0.18);
    }
    .ukiepc .pill {
      border-radius: 999px;
      border: 2px solid #f3cde3;
      background: #fff;
      box-shadow: 0 3px 0 #f3d6e7;
      transition: transform .08s ease, box-shadow .08s ease;
    }
    .ukiepc .pill:hover { transform: translateY(-1px); }
    .ukiepc .pill:active { transform: translateY(2px); box-shadow: 0 1px 0 #f3d6e7; }
    .ukiepc .pill.on { background: linear-gradient(135deg, #ffd3e8, #e5d4ff); border-color: #e6a9cf; }
    .ukiepc .bar { border-radius: 999px; background: #fbeaf3; overflow: hidden; height: 12px; }
    .ukiepc .bar > div { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #ff9ecb, #c7a6ff, #9ee7ff); transition: width .3s ease; }
    .ukiepc .check {
      width: 24px; height: 24px; border-radius: 999px; border: 2px solid #e6a9cf; background: #fff; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; color: #fff;
      transition: transform .1s ease, background .15s ease;
    }
    .ukiepc .check:hover { transform: scale(1.1); }
    .ukiepc .check.on { background: linear-gradient(135deg, #ff8fc4, #b58cff); border-color: #ff8fc4; }
    .ukiepc .check.tried { background: #ffe3c2; border-color: #f2b56b; color: #b56a00; }
    .ukiepc .check.refresh { background: #e4e1ea; border-color: #b4adc2; color: #8a8499; }
    .ukiepc input, .ukiepc select, .ukiepc textarea {
      border-radius: 16px; border: 2px solid #f3cde3; background: #fffafc; padding: 8px 14px; outline: none;
    }
    .ukiepc input:focus, .ukiepc select:focus, .ukiepc textarea:focus { border-color: #e6a9cf; box-shadow: 0 0 0 4px #ffe4f1; }
    .ukiepc pre { border-radius: 18px; background: #fbf6ff; border: 2px solid #e9dcff; }
    .ukiepc h1, .ukiepc h2, .ukiepc h3 { letter-spacing: -0.01em; }
    .ukiepc .tag { border-radius: 999px; padding: 2px 10px; font-size: 10px; font-weight: 700; }
    .ukiepc.sky { background: linear-gradient(180deg, #ffeaf5 0%, #efe6ff 45%, #e3f6ff 100%); }
    @media print {
      .no-print { display: none !important; }
      .ukiepc, .ukiepc.sky { background: white !important; }
      .print-block { break-inside: avoid; }
      pre { font-size: 9.5px !important; line-height: 1.25 !important; }
    }
  `}</style>
);

const Ukiepc = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => loadStoredUser());
  const [view, setView] = useState<View>("blind75");
  const [loading, setLoading] = useState(false);
  const [dbMissing, setDbMissing] = useState(false);
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});
  const [solves, setSolves] = useState<SolveRow[]>([]);
  const [openMl, setOpenMl] = useState<Record<string, boolean>>({ implement: true });

  // auth form
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [nameInput, setNameInput] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // solve-log form
  const [slug, setSlug] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [result, setResult] = useState("AC");
  const [minutes, setMinutes] = useState("");
  const [solveNotes, setSolveNotes] = useState("");

  useEffect(() => {
    if (user) load(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username]);

  const load = async (u: User) => {
    setLoading(true);
    try {
      const [{ data: p, error: pe }, { data: s, error: se }] = await Promise.all([
        supabase.from("ukiepc_progress").select("*").eq("username", u.username),
        supabase.from("ukiepc_solves").select("*").eq("username", u.username).order("solved_at", { ascending: false }),
      ]);
      if (isMissingTable(pe) || isMissingTable(se)) {
        setDbMissing(true);
        return;
      }
      if (pe) throw pe;
      if (se) throw se;
      const map: Record<string, ProgressRow> = {};
      (p ?? []).forEach((row: ProgressRow) => (map[row.key] = row));
      setProgress(map);
      setSolves((s ?? []) as SolveRow[]);
    } catch (e) {
      console.error(e);
      toast.error("Could not load your progress");
    } finally {
      setLoading(false);
    }
  };

  // ---------- auth ----------
  const submitAuth = async () => {
    const display = nameInput.trim();
    const username = normalizeUsername(display);
    if (username.length < 2 || username.length > 32) {
      toast.error("Pick a name between 2 and 32 characters");
      return;
    }
    setAuthBusy(true);
    try {
      const { data: existing, error } = await supabase.from("ukiepc_users").select("*").eq("username", username).maybeSingle();
      if (isMissingTable(error)) {
        setDbMissing(true);
        toast.error("The Supabase tables are not set up yet");
        return;
      }
      if (error) throw error;

      if (authMode === "login") {
        if (!existing) {
          toast.error("No one by that name yet. Sign up instead?");
          setAuthMode("signup");
          return;
        }
        finishAuth(existing as User);
        toast.success(`Welcome back, ${existing.display_name}`);
      } else {
        if (existing) {
          toast.error("That name is taken. If it's you, log in instead.");
          setAuthMode("login");
          return;
        }
        const { data: created, error: ce } = await supabase
          .from("ukiepc_users")
          .insert([{ username, display_name: display }])
          .select()
          .single();
        if (ce) throw ce;
        finishAuth(created as User);
        toast.success(`Hi ${display}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong, try again");
    } finally {
      setAuthBusy(false);
    }
  };

  const finishAuth = (u: User) => {
    const clean = { username: u.username, display_name: u.display_name };
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(clean));
    } catch {
      /* ignore */
    }
    setUser(clean);
    setNameInput("");
  };

  const logout = () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
    setProgress({});
    setSolves([]);
    setView("blind75");
  };

  // ---------- progress ----------
  const saveProgress = async (key: string, done: boolean, notes: string) => {
    if (!user) return;
    const before = progress[key];
    const row: ProgressRow = { username: user.username, key, done, notes, updated_at: new Date().toISOString() };
    setProgress((prev) => ({ ...prev, [key]: row }));
    const { error } = await supabase.from("ukiepc_progress").upsert(row);
    if (error) {
      console.error(error);
      toast.error("Could not save");
      setProgress((prev) => {
        const copy = { ...prev };
        if (before) copy[key] = before;
        else delete copy[key];
        return copy;
      });
    }
  };

  const setTaskState = (task: Task, state: TaskState) => saveProgress(task.id, state === "done", state === "tried" ? "tried" : "");

  const cycleTask = (task: Task) => setTaskState(task, nextState[stateOf(progress[task.id])]);

  // Blind 75 and tensor puzzle rows share the progress table; only the id matters to setTaskState.
  const cycleB75 = (p: B75Problem) => cycleTask({ id: b75Key(p), kind: "solve", title: p.title });
  const cycleTp = (p: TensorPuzzle) => cycleTask({ id: p.id, kind: "solve", title: p.name });

  const cycleMl = (t: MlTopic) => {
    const state = nextMlState[mlStateOf(progress[t.id])];
    saveProgress(t.id, state !== "empty", state === "refresh" ? "refresh" : "");
  };

  const addSolve = async () => {
    if (!user) return;
    const cleanSlug = slug.trim().replace(/^https?:\/\/open\.kattis\.com\/problems\//, "").replace(/\/.*$/, "");
    if (!cleanSlug) {
      toast.error("Enter a Kattis problem slug or URL");
      return;
    }
    const row = {
      username: user.username,
      slug: cleanSlug,
      topic,
      result,
      minutes: minutes ? parseInt(minutes, 10) : null,
      notes: solveNotes,
    };
    const { data, error } = await supabase.from("ukiepc_solves").insert([row]).select().single();
    if (error) {
      console.error(error);
      toast.error("Could not log the problem");
      return;
    }
    setSolves((prev) => [data as SolveRow, ...prev]);
    setSlug("");
    setMinutes("");
    setSolveNotes("");
    toast.success(result === "AC" ? "Accepted, logged" : "Logged");
  };

  const deleteSolve = async (id: number) => {
    const { error } = await supabase.from("ukiepc_solves").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete");
      return;
    }
    setSolves((prev) => prev.filter((s) => s.id !== id));
  };

  const b75Done = blind75.reduce((n, c) => n + c.problems.filter((p) => progress[b75Key(p)]?.done).length, 0);
  const mlKnown = mlSections.reduce((n, s) => n + s.topics.filter((t) => mlStateOf(progress[t.id]) === "know").length, 0);
  const mlRefresh = mlSections.reduce((n, s) => n + s.topics.filter((t) => mlStateOf(progress[t.id]) === "refresh").length, 0);
  const tpDone = tensorPuzzles.filter((p) => progress[p.id]?.done).length;

  const topicStats = useMemo(() => {
    const m: Record<string, { ac: number; tries: number }> = {};
    solves.forEach((s) => {
      const k = s.topic ?? "other";
      m[k] = m[k] ?? { ac: 0, tries: 0 };
      m[k].tries += 1;
      if (s.result === "AC") m[k].ac += 1;
    });
    return Object.entries(m).sort((a, b) => b[1].tries - a[1].tries);
  }, [solves]);

  // ---------- auth screen ----------
  if (!user) {
    return (
      <div className="min-h-screen sky ukiepc flex items-center justify-center p-4">
        <PageStyle />
        <div className="bubble w-full max-w-md p-6 sm:p-8 text-center">
          <h1 className="text-2xl font-bold text-[#c2407f]">interview dashboard</h1>

          <div className="flex justify-center gap-2 mt-5">
            <button onClick={() => setAuthMode("login")} className={`pill px-4 py-1.5 text-sm font-bold ${authMode === "login" ? "on" : ""}`}>
              log in
            </button>
            <button onClick={() => setAuthMode("signup")} className={`pill px-4 py-1.5 text-sm font-bold ${authMode === "signup" ? "on" : ""}`}>
              sign up
            </button>
          </div>

          <div className="mt-5 text-left">
            <label className="text-xs font-bold text-[#7a5a74] block mb-1 ml-2">{authMode === "login" ? "your name" : "pick a name"}</label>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !authBusy && submitAuth()}
                            maxLength={32}
              className="w-full text-base"
              autoFocus
            />
          </div>

          {authMode === "signup" ? (
            <div className="mt-4 text-xs text-[#7a5a74] text-left bg-[#fff6fb] rounded-2xl p-3 border-2 border-[#fbe3ef]">
              <p>Your name is the only key to your progress, so anyone who types it can see and edit it. Please be respectful and don't change other people's accounts!</p>
            </div>
          ) : (
            <p className="mt-4 text-xs text-[#7a5a74]">Enter the name you signed up with.</p>
          )}

          <button onClick={submitAuth} disabled={authBusy} className="pill on w-full mt-5 py-2.5 font-bold text-[#8a2f5e] disabled:opacity-60">
            {authBusy ? "..." : authMode === "login" ? "log in" : "sign up"}
          </button>

          {dbMissing && (
            <p className="mt-4 text-xs text-[#8a6500] bg-[#fff8cf] rounded-2xl p-3 border-2 border-[#f3e39a] text-left">
              Supabase tables not found. Run <code>supabase-ukiepc-schema.sql</code> in the SQL Editor first.
            </p>
          )}

          <button onClick={() => navigate("/")} className="mt-5 text-xs text-[#a67a9c] hover:underline">
            ← back to the desktop
          </button>
        </div>
      </div>
    );
  }

  // ---------- main ----------
  return (
    <div className="min-h-screen sky ukiepc pb-16 text-[#4b3350]">
      <PageStyle />

      {/* Header */}
      <div className="sticky top-0 z-10 no-print px-3 sm:px-6 pt-3">
        <div className="bubble max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/")} className="pill px-3 py-1.5 text-sm font-bold" title="Back to the desktop">
                home
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-[#c2407f]">interview dashboard</h1>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <span className="font-bold">{user.display_name}</span>
              <button onClick={logout} className="pill px-2.5 py-1 text-xs font-bold">
                switch
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {(
              [
                ["blind75", "blind 75"],
                ["ml", "ml researcher"],
                ["tensors", "tensor puzzles"],
                ["log", "solve log"],
              ] as [View, string][]
            ).map(([v, label]) => (
              <button key={v} onClick={() => setView(v)} className={`pill px-3.5 py-1.5 text-sm font-bold ${view === v ? "on" : ""}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 space-y-4">
        {dbMissing && (
          <div className="bubble p-4 text-sm" style={{ background: "#fff8cf", borderColor: "#f3e39a" }}>
            <p className="font-bold mb-1">Supabase tables not found</p>
            <p>
              Progress is not being saved yet. Run <code className="bg-white px-1 rounded">supabase-ukiepc-schema.sql</code> in the Supabase SQL Editor, then reload.
            </p>
          </div>
        )}
        {loading && <p className="text-sm text-center text-[#a67a9c]">loading your progress…</p>}

        {/* BLIND 75 */}
        {view === "blind75" && (
          <>
            <div className="bubble p-4 sm:p-6">
              <Stat label="blind 75" value={`${b75Done} / ${blind75Count}`} pct={pct(b75Done, blind75Count)} />
            </div>

            {(() => {
              let offset = 0;
              return blind75.map((cat, ci) => {
                const start = offset;
                offset += cat.problems.length;
                const pastel = dayPastels[ci % dayPastels.length];
                const done = cat.problems.filter((p) => progress[b75Key(p)]?.done).length;
                return (
                  <div key={cat.name} className="bubble p-4 sm:p-5" style={{ background: pastel.bg, borderColor: pastel.border, boxShadow: `0 6px 0 ${pastel.border}` }}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <h2 className="text-base font-bold">{cat.name}</h2>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold">
                          {done}/{cat.problems.length}
                        </div>
                        <div className="bar w-24 mt-1" style={{ background: "#ffffffaa" }}>
                          <div style={{ width: `${pct(done, cat.problems.length)}%` }} />
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2 mt-3 rounded-3xl bg-white/70 p-3 sm:p-4">
                      {cat.problems.map((p, pi) => {
                        const state = stateOf(progress[b75Key(p)]);
                        return (
                          <li key={p.slug} className="flex items-start gap-3 text-sm">
                            <button
                              onClick={() => cycleB75(p)}
                              title={state === "empty" ? "click: done" : state === "done" ? "click: tried but failed" : "click: clear"}
                              aria-label={`state: ${state}`}
                              className={`check mt-0.5 ${state === "done" ? "on" : state === "tried" ? "tried" : ""}`}
                            >
                              {state === "done" && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                              {state === "tried" && <X className="w-3.5 h-3.5" strokeWidth={3} />}
                            </button>
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="text-[11px] font-bold text-[#a67a9c] w-7 shrink-0">{start + pi + 1}.</span>
                              <span className={state === "done" ? "line-through text-[#a67a9c]" : state === "tried" ? "text-[#b56a00]" : ""}>
                                {p.title} <span className="text-[11px] text-[#a67a9c]">LC {p.num}</span>
                              </span>
                              {p.premium && <span className="tag bg-[#fff1c2] text-[#8a6500]">premium</span>}
                              <a href={leetcodeUrl(p.slug)} target="_blank" rel="noreferrer" className="text-[#c2407f] font-bold inline-flex items-center gap-1 hover:underline">
                                open
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              });
            })()}
          </>
        )}

        {/* ML RESEARCHER */}
        {view === "ml" && (
          <>
            <div className="bubble p-4 sm:p-6">
              <Stat
                label="topics you know cold"
                value={`${mlKnown} / ${mlTopicCount}`}
                pct={pct(mlKnown, mlTopicCount)}
                hint={mlRefresh > 0 ? `plus ${mlRefresh} marked for a refresher` : undefined}
              />
            </div>

            {mlSections.map((sec, si) => {
              const pastel = dayPastels[si % dayPastels.length];
              const know = sec.topics.filter((t) => mlStateOf(progress[t.id]) === "know").length;
              const refresh = sec.topics.filter((t) => mlStateOf(progress[t.id]) === "refresh").length;
              const open = !!openMl[sec.id];
              return (
                <div key={sec.id} className="bubble" style={{ background: pastel.bg, borderColor: pastel.border, boxShadow: `0 6px 0 ${pastel.border}` }}>
                  <button onClick={() => setOpenMl((p) => ({ ...p, [sec.id]: !open }))} className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold">{sec.name}</span>
                        {know === sec.topics.length && <span className="tag bg-[#bff0d6] text-[#1f6b48]">done</span>}
                      </div>
                      {refresh > 0 && <div className="text-[11px] text-[#8a8499] font-bold mt-0.5">{refresh} to refresh</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold">
                        {know}/{sec.topics.length}
                      </div>
                      <div className="bar w-24 mt-1" style={{ background: "#ffffffaa" }}>
                        <div style={{ width: `${pct(know, sec.topics.length)}%` }} />
                      </div>
                    </div>
                  </button>

                  {open && (
                    <div className="px-4 sm:px-5 pb-5 space-y-3">
                      {sec.blurb && <p className="text-sm text-[#7a5a74] italic">{sec.blurb}</p>}
                      <ul className="space-y-2 rounded-3xl bg-white/70 p-3 sm:p-4">
                        {sec.topics.map((t) => {
                          const state = mlStateOf(progress[t.id]);
                          return (
                            <li key={t.id} className="flex items-start gap-3 text-sm">
                              <button
                                onClick={() => cycleMl(t)}
                                title={state === "empty" ? "click: know it" : state === "know" ? "click: needs a refresher" : "click: clear"}
                                aria-label={`state: ${state}`}
                                className={`check mt-0.5 ${state === "know" ? "on" : state === "refresh" ? "refresh" : ""}`}
                              >
                                {state !== "empty" && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                              </button>
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className={state === "know" ? "line-through text-[#a67a9c]" : state === "refresh" ? "text-[#8a8499]" : t.important ? "font-bold" : ""}>
                                  {t.important ? "⭐ " : ""}
                                  {t.title}
                                </span>
                                {t.links?.map((l) => (
                                  <a
                                    key={l.url}
                                    href={l.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={l.tip}
                                    className="text-[#c2407f] text-xs font-bold inline-flex items-center gap-1 hover:underline"
                                  >
                                    {l.label}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* TENSOR PUZZLES */}
        {view === "tensors" && (
          <>
            <div className="bubble p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[220px]">
                  <Stat label="tensor puzzles" value={`${tpDone} / ${tensorPuzzles.length}`} pct={pct(tpDone, tensorPuzzles.length)} />
                  <p className="text-xs text-[#a67a9c] mt-3">
                    Sasha Rush's 21 one-liners: reimplement each function with nothing but broadcasting. The Colab button opens the notebook ready to run in the browser, no setup.
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a href={tensorPuzzlesColabUrl} target="_blank" rel="noreferrer" className="pill on px-3 py-1.5 text-sm font-bold flex items-center gap-2 text-[#8a2f5e]">
                    <ExternalLink className="w-4 h-4" /> open in Colab
                  </a>
                  <a href={tensorPuzzlesRepoUrl} target="_blank" rel="noreferrer" className="pill px-3 py-1.5 text-sm font-bold flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> the repo
                  </a>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-[#fff6fb] border-2 border-[#fbe3ef] p-3">
                <div className="text-xs font-bold mb-1">the rules</div>
                <ul className="text-xs space-y-1">
                  {tensorPuzzleRules.map((r) => (
                    <li key={r}>· {r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bubble p-4 sm:p-5" style={{ background: "#ece2ff", borderColor: "#c9b4f5", boxShadow: "0 6px 0 #c9b4f5" }}>
              <ul className="space-y-2 rounded-3xl bg-white/70 p-3 sm:p-4">
                {tensorPuzzles.map((p, pi) => {
                  const state = stateOf(progress[p.id]);
                  return (
                    <li key={p.id} className="flex items-start gap-3 text-sm">
                      <button
                        onClick={() => cycleTp(p)}
                        title={state === "empty" ? "click: done" : state === "done" ? "click: tried but failed" : "click: clear"}
                        aria-label={`state: ${state}`}
                        className={`check mt-0.5 ${state === "done" ? "on" : state === "tried" ? "tried" : ""}`}
                      >
                        {state === "done" && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                        {state === "tried" && <X className="w-3.5 h-3.5" strokeWidth={3} />}
                      </button>
                      <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                        <span className="text-[11px] font-bold text-[#a67a9c] w-6 shrink-0">{pi + 1}.</span>
                        <code className={`font-bold ${state === "done" ? "line-through text-[#a67a9c]" : state === "tried" ? "text-[#b56a00]" : ""}`}>{p.name}</code>
                        <span className="text-xs text-[#7a5a74]">{p.what}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        {/* SOLVE LOG */}
        {view === "log" && (
          <>
            <div className="bubble p-4 sm:p-6">
              <h2 className="font-bold mb-3 text-base">log a problem</h2>
              <div className="grid sm:grid-cols-6 gap-2 text-sm">
                <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Kattis slug or URL" className="sm:col-span-2" />
                <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {topics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <select value={result} onChange={(e) => setResult(e.target.value)}>
                  {["AC", "WA", "TLE", "RTE", "gave up"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <input value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))} placeholder="minutes" inputMode="numeric" />
                <button onClick={addSolve} className="pill on px-3 py-1.5 font-bold text-[#8a2f5e]">
                  log it
                </button>
                <input value={solveNotes} onChange={(e) => setSolveNotes(e.target.value)} placeholder="notes: the trick, the bug, what to remember" className="sm:col-span-6" />
              </div>
            </div>

            {topicStats.length > 0 && (
              <div className="bubble p-4 sm:p-6">
                <h2 className="font-bold mb-3 text-base">by topic</h2>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {topicStats.map(([t, s]) => (
                    <div key={t} className="flex items-center gap-2">
                      <span className="w-32 shrink-0">{t}</span>
                      <div className="bar flex-1">
                        <div style={{ width: `${pct(s.ac, s.tries)}%` }} />
                      </div>
                      <span className="w-16 text-right text-xs text-[#a67a9c]">
                        {s.ac}/{s.tries} AC
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bubble p-4 sm:p-6">
              <h2 className="font-bold mb-3 text-base">
                 history <span className="text-[#a67a9c] font-normal text-sm">({solves.length})</span>
              </h2>
              {solves.length === 0 ? (
                <p className="text-sm text-[#a67a9c] italic">Nothing logged yet. Solve Hello World and come back </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-[#a67a9c]">
                        <th className="py-1 pr-2">when</th>
                        <th className="py-1 pr-2">problem</th>
                        <th className="py-1 pr-2">topic</th>
                        <th className="py-1 pr-2">result</th>
                        <th className="py-1 pr-2">min</th>
                        <th className="py-1 pr-2">notes</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {solves.map((s) => (
                        <tr key={s.id} className="border-t border-[#fbe3ef] align-top">
                          <td className="py-1.5 pr-2 whitespace-nowrap text-xs text-[#a67a9c]">
                            {new Date(s.solved_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-1.5 pr-2">
                            <a href={kattisUrl(s.slug)} target="_blank" rel="noreferrer" className="text-[#c2407f] font-bold hover:underline">
                              {s.slug}
                            </a>
                          </td>
                          <td className="py-1.5 pr-2">{s.topic}</td>
                          <td className={`py-1.5 pr-2 font-bold ${s.result === "AC" ? "text-[#1f6b48]" : "text-[#c2407f]"}`}>{s.result}</td>
                          <td className="py-1.5 pr-2">{s.minutes ?? ""}</td>
                          <td className="py-1.5 pr-2 text-xs">{s.notes}</td>
                          <td className="py-1.5">
                            <button onClick={() => deleteSolve(s.id)} className="text-[#a67a9c] hover:text-[#c2407f]" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

const Stat = ({ label, value, pct, hint }: { label: string; value: string; pct: number; hint?: string }) => (
  <div>
    <div className="flex items-baseline justify-between">
      <span className="text-xs font-bold text-[#a67a9c]">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
    <div className="bar mt-1">
      <div style={{ width: `${pct}%` }} />
    </div>
    {hint && <div className="text-[10px] text-[#a67a9c] mt-0.5">{hint}</div>}
  </div>
);

export default Ukiepc;
