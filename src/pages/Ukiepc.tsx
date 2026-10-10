import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ExternalLink, Trash2, Printer, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { modules, snippets, topics, kattisUrl, taskHref, type Task, type Module } from "@/data/ukiepc";
import { resourceNotes, resourceGroups } from "@/data/ukiepcResources";

type View = "plan" | "log" | "resources" | "cheatsheet";

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

const kindLabel: Record<Task["kind"], string> = { read: "read", warmup: "warm up", solve: "contest-style", do: "do" };
const kindColor: Record<Task["kind"], string> = {
  read: "bg-[#dbeeff] text-[#2b5c8a]",
  warmup: "bg-[#d9f7e8] text-[#1f6b48]",
  solve: "bg-[#ffd9ea] text-[#a0306b]",
  do: "bg-[#fff1c2] text-[#8a6500]",
};
const sections: { kind: Task["kind"]; heading: string; blurb: string }[] = [
  { kind: "read", heading: "Learn", blurb: "Read these first. Skim, do not study: you will come back when a problem needs it." },
  { kind: "warmup", heading: "Warm up", blurb: "Short, no input parsing, instant feedback. Stop once the idea feels obvious." },
  { kind: "solve", heading: "Contest-style", blurb: "Kattis problems with real I/O and time limits, the shape of what you will see on Saturday. Easy to harder." },
  { kind: "do", heading: "Do", blurb: "" },
];

// one pastel per day
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
  const [view, setView] = useState<View>("plan");
  const [loading, setLoading] = useState(false);
  const [dbMissing, setDbMissing] = useState(false);
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});
  const [solves, setSolves] = useState<SolveRow[]>([]);
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

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

  // open the first module that still has unfinished tasks once progress is known
  useEffect(() => {
    if (loading) return;
    const t = modules.find((m) => m.tasks.some((task) => !progress[task.id]?.done)) ?? modules[0];
    setOpenDays({ [t.id]: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.username]);

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
      const drafts: Record<string, string> = {};
      modules.forEach((d) => (drafts[d.id] = map[`note:${d.id}`]?.notes ?? ""));
      setNoteDrafts(drafts);
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
    setView("plan");
  };

  // ---------- progress ----------
  const setTaskState = async (task: Task, state: TaskState) => {
    if (!user) return;
    const before = progress[task.id];
    const row: ProgressRow = {
      username: user.username,
      key: task.id,
      done: state === "done",
      notes: state === "tried" ? "tried" : "",
      updated_at: new Date().toISOString(),
    };
    setProgress((prev) => ({ ...prev, [task.id]: row }));
    const { error } = await supabase.from("ukiepc_progress").upsert(row);
    if (error) {
      console.error(error);
      toast.error("Could not save");
      setProgress((prev) => {
        const copy = { ...prev };
        if (before) copy[task.id] = before;
        else delete copy[task.id];
        return copy;
      });
    }
  };

  const cycleTask = (task: Task) => setTaskState(task, nextState[stateOf(progress[task.id])]);

  const saveDayNote = async (day: Module) => {
    if (!user) return;
    const key = `note:${day.id}`;
    const notes = noteDrafts[day.id] ?? "";
    const row: ProgressRow = { username: user.username, key, done: false, notes, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("ukiepc_progress").upsert(row);
    if (error) {
      console.error(error);
      toast.error("Could not save note");
      return;
    }
    setProgress((prev) => ({ ...prev, [key]: row }));
    toast.success("Note saved");
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
    const task = modules.flatMap((d) => d.tasks).find((t) => t.kattis === cleanSlug);
    if (task) {
      const st = stateOf(progress[task.id]);
      if (result === "AC" && st !== "done") setTaskState(task, "done");
      else if (result !== "AC" && st === "empty") setTaskState(task, "tried");
    }
  };

  const deleteSolve = async (id: number) => {
    const { error } = await supabase.from("ukiepc_solves").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete");
      return;
    }
    setSolves((prev) => prev.filter((s) => s.id !== id));
  };

  const allTasks = useMemo(() => modules.flatMap((d) => d.tasks), []);
  const doneCount = allTasks.filter((t) => progress[t.id]?.done).length;
  const solveTasks = allTasks.filter((t) => t.kind === "solve" || t.kind === "warmup");
  const solvedCount = solveTasks.filter((t) => progress[t.id]?.done).length;

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
          <h1 className="text-2xl font-bold text-[#c2407f]">UKIEPC 2026 training</h1>

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
              <h1 className="text-lg sm:text-xl font-bold text-[#c2407f]">UKIEPC 2026 training</h1>
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
                ["plan", "plan"],
                ["log", "solve log"],
                ["resources", "resources"],
                ["cheatsheet", "cheat sheet"],
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

        {/* PLAN */}
        {view === "plan" && (
          <>
            <div className="bubble p-4 sm:p-6">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <Stat label="checklist" value={`${doneCount} / ${allTasks.length}`} pct={pct(doneCount, allTasks.length)} />
                <Stat label="problems solved" value={`${solvedCount} / ${solveTasks.length}`} pct={pct(solvedCount, solveTasks.length)} />
              </div>
              <p className="text-xs text-[#a67a9c] mt-3">Click a circle once for done, twice for tried but failed, three times to clear it.</p>
            </div>

            {modules.map((day, di) => {
              const pastel = dayPastels[di % dayPastels.length];
              const done = day.tasks.filter((t) => progress[t.id]?.done).length;
              const open = !!openDays[day.id];
              return (
                <div key={day.id} className="bubble" style={{ background: pastel.bg, borderColor: pastel.border, boxShadow: `0 6px 0 ${pastel.border}` }}>
                  <button onClick={() => setOpenDays((p) => ({ ...p, [day.id]: !open }))} className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#a67a9c]">{di + 1} of {modules.length}</span>
                          {done === day.tasks.length && <span className="tag bg-[#bff0d6] text-[#1f6b48]">done</span>}
                        </div>
                        <div className="text-base font-bold mt-0.5">{day.theme}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold">
                        {done}/{day.tasks.length}
                      </div>
                      <div className="bar w-24 mt-1" style={{ background: "#ffffffaa" }}>
                        <div style={{ width: `${pct(done, day.tasks.length)}%` }} />
                      </div>
                    </div>
                  </button>

                  {open && (
                    <div className="px-4 sm:px-5 pb-5 space-y-4">
                      <p className="text-sm text-[#7a5a74] italic">{day.why}</p>
                      {sections.map((sec) => {
                        const list = day.tasks.filter((t) => t.kind === sec.kind);
                        if (list.length === 0) return null;
                        const secDone = list.filter((t) => progress[t.id]?.done).length;
                        return (
                          <div key={sec.kind} className="rounded-3xl bg-white/70 p-3 sm:p-4">
                            <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                              <h3 className="text-sm font-bold">
                                {sec.heading}
                              </h3>
                              <span className="text-[11px] text-[#a67a9c] font-bold">
                                {secDone}/{list.length}
                              </span>
                              {sec.blurb && <span className="text-[11px] text-[#a67a9c]">· {sec.blurb}</span>}
                            </div>
                            <ul className="space-y-2">
                              {list.map((task) => {
                                const state = stateOf(progress[task.id]);
                                const checked = state === "done";
                                const href = taskHref(task);
                                const linkText = task.kattis ?? task.leetcode ?? task.hackerrank ?? "link";
                                return (
                                  <li key={task.id} className="flex items-start gap-3 text-sm">
                                    <button
                                      onClick={() => cycleTask(task)}
                                      title={state === "empty" ? "click: done" : state === "done" ? "click: tried but failed" : "click: clear"}
                                      aria-label={`state: ${state}`}
                                      className={`check mt-0.5 ${state === "done" ? "on" : state === "tried" ? "tried" : ""}`}
                                    >
                                      {state === "done" && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                      {state === "tried" && <X className="w-3.5 h-3.5" strokeWidth={3} />}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`tag ${kindColor[task.kind]}`}>{kindLabel[task.kind]}</span>
                                        <span className={checked ? "line-through text-[#a67a9c]" : state === "tried" ? "text-[#b56a00]" : task.important ? "font-bold" : ""}>{task.important ? "⭐ " : ""}{task.title}</span>
                                        {href && (
                                          <a href={href} target="_blank" rel="noreferrer" className="text-[#c2407f] font-bold inline-flex items-center gap-1 hover:underline">
                                            {linkText}
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        )}
                                      </div>
                                      {task.detail && <p className="text-xs text-[#7a5a74] mt-1">{task.detail}</p>}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                      <div>
                        <label className="text-xs font-bold block mb-1 ml-2">notes for this topic (what tripped you up, what to put in the reference doc)</label>
                        <textarea value={noteDrafts[day.id] ?? ""} onChange={(e) => setNoteDrafts((p) => ({ ...p, [day.id]: e.target.value }))} rows={3} className="w-full text-sm font-mono" />
                        <button
                          onClick={() => saveDayNote(day)}
                          disabled={(noteDrafts[day.id] ?? "") === (progress[`note:${day.id}`]?.notes ?? "")}
                          className="pill px-3 py-1 text-xs font-bold mt-1 disabled:opacity-50"
                        >
                          save note
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
              <p className="text-xs text-[#a67a9c] mt-2">An accepted log entry for a problem in the plan marks it done; any other result marks it tried.</p>
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

        {/* RESOURCES */}
        {view === "resources" && (
          <>
            <div className="bubble p-4 sm:p-6 no-print">
              <h2 className="font-bold text-base mb-1">the important bits from every page in the plan</h2>
              <p className="text-sm text-[#7a5a74]">
                Each card summarises one tutorial linked from the plan: what it says, what to remember, where people go wrong. Read the card, then open the page only if you want the proofs.
              </p>
            </div>
            {resourceNotes.length === 0 && <p className="text-sm text-center text-[#a67a9c]">summaries coming soon </p>}
            {resourceGroups.map((g) => {
              const notes = resourceNotes.filter((n) => g.topics.includes(n.topic));
              if (notes.length === 0) return null;
              return (
                <div key={g.label} className="space-y-3">
                  <h2 className="font-bold text-base ml-2 mt-2">
                    {g.label}
                  </h2>
                  {notes.map((n) => (
                    <div key={n.url} className="bubble p-4 sm:p-5 print-block">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <h3 className="font-bold text-sm">{n.title}</h3>
                        <a href={n.url} target="_blank" rel="noreferrer" className="text-xs text-[#c2407f] font-bold inline-flex items-center gap-1 hover:underline">
                          open page <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <ul className="text-sm mt-2 space-y-1 list-disc pl-5">
                        {n.keyIdeas.map((k) => (
                          <li key={k}>{k}</li>
                        ))}
                      </ul>
                      {n.pitfalls.length > 0 && (
                        <div className="mt-3 rounded-2xl bg-[#fff6fb] border-2 border-[#fbe3ef] p-3">
                          <div className="text-xs font-bold mb-1">watch out</div>
                          <ul className="text-xs space-y-1">
                            {n.pitfalls.map((p) => (
                              <li key={p}>· {p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {n.snippet && (
                        <pre className="p-3 text-xs overflow-x-auto leading-snug mt-3">
                          <code>{n.snippet}</code>
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}

        {/* CHEAT SHEET */}
        {view === "cheatsheet" && (
          <>
            <div className="bubble p-4 sm:p-6 no-print flex items-start justify-between gap-3 flex-wrap">
              <div className="text-sm">
                <h2 className="font-bold text-base mb-1">team reference document</h2>
                <p className="text-[#7a5a74]">Printed material is allowed in the contest (up to 25 A4 pages). Print this tab, add your day notes, and bring it. Everything below is Python 3.9 / PyPy-safe.</p>
              </div>
              <button onClick={() => window.print()} className="pill px-3 py-1.5 text-sm font-bold flex items-center gap-2">
                <Printer className="w-4 h-4" /> print
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {snippets.map((s) => (
                <div key={s.title} className="bubble p-4 print-block">
                  <h3 className="font-bold text-sm mb-2">{s.title}</h3>
                  <pre className="p-3 text-xs overflow-x-auto leading-snug">
                    <code>{s.code}</code>
                  </pre>
                </div>
              ))}
              {modules.some((d) => (progress[`note:${d.id}`]?.notes ?? "").trim()) && (
                <div className="bubble p-4 print-block md:col-span-2">
                  <h3 className="font-bold text-sm mb-2">your notes</h3>
                  {modules.map((d) => {
                    const n = (progress[`note:${d.id}`]?.notes ?? "").trim();
                    if (!n) return null;
                    return (
                      <div key={d.id} className="mb-2">
                        <div className="text-xs font-bold">{d.theme}</div>
                        <pre className="text-xs whitespace-pre-wrap p-2">{n}</pre>
                      </div>
                    );
                  })}
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
