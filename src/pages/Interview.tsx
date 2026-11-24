import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Lock, Play, RotateCcw, Timer, Terminal, CheckCircle2, XCircle, ChevronRight, Sparkles } from "lucide-react";
import { problems, stageLabel, type Problem, type TestCase } from "@/data/interview";
import { ensurePyodide, onPyStatus, pyReset, pyRun, pySubmit, type PyStatus } from "@/lib/pyRunner";
import DeepMindReadingList from "@/components/DeepMindReadingList";
import JaxMathsTracker from "@/components/JaxMathsTracker";
import { readingSections, readKey } from "@/data/deepmindReading";
import { jaxSections, jaxKey } from "@/data/jaxMaths";

const API_KEY = "interview_api_url";
// which prep is showing: anthropic = coding problems, deepmind = multi-agent flourishing readings,
// jax = JAX + maths-for-AI tracker. Each tab has its own colour theme (see PageStyle).
const TAB_KEY = "interview_tab";
type Tab = "anthropic" | "deepmind" | "jax";
const TABS: Tab[] = ["anthropic", "deepmind", "jax"];
const TAB_LABEL: Record<Tab, string> = { anthropic: "anthropic", deepmind: "deepmind", jax: "jax & maths" };
const TAB_TITLE: Record<Tab, string> = {
  anthropic: "coding problems in the Anthropic interview format",
  deepmind: "multi-agent flourishing readings",
  jax: "what to learn from JAX and maths to build the ML-coding baseline",
};
const api = () => localStorage.getItem(API_KEY) || "http://localhost:8017";

// "backend" = local interview_server.py (real IPython + real threads);
// "pyodide" = in-browser WASM Python, zero setup. Backend wins when it's up.
type Engine = "backend" | "pyodide" | "loading";

const unlockedKey = (p: string) => `interview_unlocked_${p}`;
const codeKey = (p: string) => `interview_code_${p}`;
const timerKey = (p: string) => `interview_timer_${p}`;
const solvedKey = (p: string) => `interview_solved_${p}`;

const getUnlocked = (p: Problem) => {
  const n = parseInt(localStorage.getItem(unlockedKey(p.id)) ?? "1", 10);
  return Math.min(Math.max(1, isNaN(n) ? 1 : n), p.levels.length);
};
const isSolved = (p: Problem) => localStorage.getItem(solvedKey(p.id)) === "1";

interface TestResult {
  name: string;
  pass: boolean;
  got: string | null;
  expected: string;
  error: string | null;
  stdout: string;
  regression?: boolean;
}

interface ConsoleEntry {
  input: string;
  out: string;
  result: string | null;
  error: string | null;
}

const PageStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');
    .interview {
      font-family: 'Quicksand', 'Nunito', system-ui, sans-serif;
      /* default (jax & maths tab): the site's pink/lilac */
      --ink: #a0306b; --muted: #8a6d99; --line: #f3cde3; --shadow: #f3d6e7; --glow: rgba(214, 150, 190, 0.18);
      --on1: #ffd3e8; --on2: #e5d4ff; --on-line: #e6a9cf; --soft: #fff0f6; --code: #f6ecff; --code-ink: #6b3fa0;
      background: linear-gradient(180deg, #ffeef7 0%, #f3ecff 60%, #e8f6ff 100%);
    }
    .interview.theme-anthropic {
      /* Anthropic terracotta orange */
      --ink: #9c4a1e; --muted: #a8714f; --line: #f3d3bf; --shadow: #f1dac9; --glow: rgba(217, 119, 87, 0.18);
      --on1: #ffd6bd; --on2: #ffe7cf; --on-line: #e9a27c; --soft: #fff2e9; --code: #fff0e4; --code-ink: #b4552a;
      background: linear-gradient(180deg, #fff0e6 0%, #fff7ee 60%, #fdf4ec 100%);
    }
    .interview.theme-deepmind {
      /* DeepMind blue */
      --ink: #1d4fb8; --muted: #6b7fb0; --line: #c8d8f7; --shadow: #d4e0f6; --glow: rgba(66, 110, 200, 0.18);
      --on1: #d0e0ff; --on2: #e3ebff; --on-line: #9db8f0; --soft: #eef3ff; --code: #e9f0ff; --code-ink: #2b55b8;
      background: linear-gradient(180deg, #e8f0ff 0%, #f2f6ff 60%, #ecf6ff 100%);
    }
    .interview .bubble {
      background: #fff; border: 2px solid var(--line); border-radius: 24px;
      box-shadow: 0 6px 0 var(--shadow), 0 10px 24px var(--glow);
    }
    .interview .pill {
      border-radius: 999px; border: 2px solid var(--line); background: #fff;
      box-shadow: 0 3px 0 var(--shadow); transition: transform .08s ease, box-shadow .08s ease;
    }
    .interview .pill:hover { transform: translateY(-1px); }
    .interview .pill:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--shadow); }
    .interview .pill.on { background: linear-gradient(135deg, var(--on1), var(--on2)); border-color: var(--on-line); }
    .interview .pill:disabled { opacity: .45; transform: none; }
    .interview .editor-wrap {
      background: #211b2e; border-radius: 18px; border: 2px solid #3a2f52;
      box-shadow: inset 0 2px 10px rgba(0,0,0,.35);
    }
    .interview textarea.code, .interview .console-in {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; line-height: 1.55;
      background: transparent; color: #f4ecff; caret-color: #ff9ecb; border: none; outline: none; resize: vertical;
      white-space: pre; tab-size: 4;
    }
    .interview .lvl {
      border-radius: 14px 14px 0 0; border: 2px solid var(--line); border-bottom: none; background: var(--soft);
      padding: 6px 14px; font-weight: 700; font-size: 13px; color: var(--ink);
    }
    .interview .lvl.on { background: linear-gradient(135deg, var(--on1), var(--on2)); }
    .interview .lvl.locked { opacity: .5; }
    .interview .spec { font-size: 13.5px; color: #5b4a66; }
    .interview .spec h3 { font-weight: 700; color: var(--ink); margin: 10px 0 4px; font-size: 14px; }
    .interview .spec p { margin: 6px 0; }
    .interview .spec ul { list-style: disc; padding-left: 20px; margin: 6px 0; }
    .interview .spec code { background: var(--code); border-radius: 6px; padding: 1px 5px; font-size: 12px; color: var(--code-ink); }
    .interview .spec pre { background: #211b2e; color: #f4ecff; border-radius: 12px; padding: 10px 12px; overflow-x: auto; font-size: 12px; margin: 8px 0; }
    .interview .spec pre code { background: transparent; color: inherit; padding: 0; }
    .interview .spec table { border-collapse: collapse; margin: 8px 0; font-size: 12.5px; }
    .interview .spec th, .interview .spec td { border: 1.5px solid var(--line); padding: 4px 8px; text-align: left; }
    .interview .spec th { background: var(--soft); color: var(--ink); }
  `}</style>
);

function fmtClock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const lines = useMemo(() => value.split("\n").length, [value]);
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: s, selectionEnd: ed } = el;
      const next = value.slice(0, s) + "    " + value.slice(ed);
      onChange(next);
      requestAnimationFrame(() => el.setSelectionRange(s + 4, s + 4));
    }
  };
  return (
    <div className="editor-wrap flex overflow-hidden">
      <div
        className="select-none text-right pr-2 pl-3 py-3 text-[#6b5d8a] text-[13px] leading-[1.55]"
        style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
      >
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        className="code flex-1 py-3 pr-3 min-h-[320px]"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

function ConsolePanel({ engine }: { engine: Engine }) {
  const [history, setHistory] = useState<ConsoleEntry[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const run = async () => {
    if (!input.trim() || busy || engine === "loading") return;
    setBusy(true);
    try {
      let d: { out?: string; result: string | null; error: string | null };
      if (engine === "backend") {
        const r = await fetch(`${api()}/run`, { method: "POST", body: JSON.stringify({ code: input }) });
        d = await r.json();
      } else {
        d = await pyRun(input);
      }
      setHistory((h) => [...h, { input, out: d.out ?? "", result: d.result, error: d.error }]);
      setInput("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "python engine unavailable");
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    try {
      if (engine === "backend") await fetch(`${api()}/reset`, { method: "POST", body: "{}" });
      else await pyReset();
      setHistory([]);
      toast.success("kernel reset ✨");
    } catch {
      toast.error("python engine unavailable");
    }
  };

  return (
    <div className="bubble p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-bold text-[color:var(--ink)]">
          <Terminal size={16} /> {engine === "backend" ? "IPython console" : "Python console"}
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${engine === "loading" ? "bg-amber-400" : "bg-emerald-400"}`}
            title={engine === "backend" ? "local IPython backend" : engine === "pyodide" ? "in-browser pyodide" : "loading python…"}
          />
        </div>
        <button className="pill px-3 py-1 text-xs font-bold text-[color:var(--ink)]" onClick={reset}>
          <RotateCcw size={12} className="inline mr-1" />reset kernel
        </button>
      </div>
      <div className="editor-wrap p-3 max-h-56 overflow-y-auto text-[13px]" style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
        {history.length === 0 && (
          <div className="text-[#6b5d8a]">
            scratch space — {engine === "backend" ? "local IPython kernel" : "python in your browser"}, state persists between cells
          </div>
        )}
        {history.map((h, i) => (
          <div key={i} className="mb-2">
            <div className="text-[#8ee7c0] whitespace-pre-wrap">
              <span className="text-[#6b5d8a]">In [{i + 1}]: </span>
              {h.input}
            </div>
            {h.out && <div className="text-[#f4ecff] whitespace-pre-wrap">{h.out}</div>}
            {h.result && (
              <div className="text-[#ffc6e3] whitespace-pre-wrap">
                <span className="text-[#6b5d8a]">Out[{i + 1}]: </span>
                {h.result}
              </div>
            )}
            {h.error && <div className="text-[#ff9b9b] whitespace-pre-wrap">{h.error}</div>}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 mt-2">
        <textarea
          className="console-in flex-1 editor-wrap px-3 py-2 min-h-[38px]"
          rows={1}
          placeholder=">>> try things here (shift+enter to run)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              run();
            }
          }}
        />
        <button className="pill on px-4 py-1 font-bold text-[color:var(--ink)]" onClick={run} disabled={busy}>
          run
        </button>
      </div>
    </div>
  );
}

function ProblemView({ problem, engine, onProgress }: { problem: Problem; engine: Engine; onProgress: () => void }) {
  const [unlocked, setUnlocked] = useState(() => getUnlocked(problem));
  const [level, setLevel] = useState(() => Math.min(getUnlocked(problem), problem.levels.length));
  const [code, setCode] = useState(() => localStorage.getItem(codeKey(problem.id)) ?? problem.starterCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [timerRunning, setTimerRunning] = useState(() => !!localStorage.getItem(timerKey(problem.id)));

  useEffect(() => {
    setUnlocked(getUnlocked(problem));
    setLevel(Math.min(getUnlocked(problem), problem.levels.length));
    setCode(localStorage.getItem(codeKey(problem.id)) ?? problem.starterCode);
    setResults(null);
    setSetupError(null);
    setTimerRunning(!!localStorage.getItem(timerKey(problem.id)));
  }, [problem]);

  // 90-minute OA timer — counts down only after the start button is pressed
  useEffect(() => {
    if (!problem.timerMinutes || !timerRunning) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [problem, timerRunning]);

  const startTimer = () => {
    localStorage.setItem(timerKey(problem.id), String(Date.now()));
    setNow(Date.now());
    setTimerRunning(true);
  };

  const deadline = timerRunning && problem.timerMinutes
    ? parseInt(localStorage.getItem(timerKey(problem.id)) ?? String(Date.now()), 10) + problem.timerMinutes * 60_000
    : null;
  const remaining = deadline ? deadline - now : null;

  const saveCode = (v: string) => {
    setCode(v);
    localStorage.setItem(codeKey(problem.id), v);
  };

  const submit = async () => {
    if (running || engine === "loading") return;
    setRunning(true);
    setResults(null);
    setSetupError(null);
    // current level's tests + all earlier levels as regression tests (real ICA re-runs everything)
    const current: TestCase[] = problem.levels[level - 1].tests;
    const earlier: TestCase[] = problem.levels.slice(0, level - 1).flatMap((l) => l.tests);
    const tests = [
      ...current.map((t) => ({ ...t, name: t.name })),
      ...earlier.map((t) => ({ ...t, name: `regression: ${t.name}` })),
    ];
    try {
      let d: { ok: boolean; error?: string; results?: TestResult[] };
      if (engine === "backend") {
        const r = await fetch(`${api()}/submit`, { method: "POST", body: JSON.stringify({ code, tests }) });
        d = await r.json();
      } else {
        d = await pySubmit(code, tests);
      }
      if (!d.ok) {
        setSetupError(d.error ?? "grader error");
        return;
      }
      const rs: TestResult[] = (d.results ?? []).map((x: TestResult) => ({ ...x, regression: x.name.startsWith("regression:") }));
      setResults(rs);
      const allPass = rs.every((x) => x.pass);
      if (allPass) {
        if (level < problem.levels.length) {
          const next = Math.max(unlocked, level + 1);
          localStorage.setItem(unlockedKey(problem.id), String(next));
          setUnlocked(next);
          setLevel(next);
          toast.success(`Level ${level} cleared! Level ${next} unlocked 🎀`);
        } else {
          localStorage.setItem(solvedKey(problem.id), "1");
          toast.success(`${problem.title} — all levels complete! 🎉`);
        }
        onProgress();
      } else {
        const failed = rs.filter((x) => !x.pass).length;
        toast.error(`${failed} test${failed > 1 ? "s" : ""} failing`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "python engine unavailable");
    } finally {
      setRunning(false);
    }
  };

  const resetProblem = () => {
    if (!confirm("Reset code, progress and timer for this problem?")) return;
    [codeKey, unlockedKey, timerKey, solvedKey].forEach((k) => localStorage.removeItem(k(problem.id)));
    setCode(problem.starterCode);
    setUnlocked(1);
    setLevel(1);
    setResults(null);
    setSetupError(null);
    setTimerRunning(false);
    onProgress();
  };

  const lv = problem.levels[level - 1];
  const score = (Math.max(unlocked - 1, isSolved(problem) ? problem.levels.length : 0) * 1000) / problem.levels.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="bubble p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="font-bold text-lg text-[color:var(--ink)]">{problem.title}</div>
          <div className="text-xs text-[color:var(--muted)]">
            {stageLabel[problem.stage]} · {problem.difficulty} · {problem.reported ? "spec from candidate reports" : "reconstructed from the title — representative, not verbatim"}
          </div>
        </div>
        {problem.timerMinutes && (
          timerRunning && remaining !== null ? (
            <div className={`pill px-4 py-1.5 font-bold ${remaining < 10 * 60_000 ? "text-rose-500" : "text-[color:var(--ink)]"}`}>
              <Timer size={14} className="inline mr-1 -mt-0.5" />
              {fmtClock(remaining)}
            </div>
          ) : (
            <button className="pill on px-4 py-1.5 font-bold text-[color:var(--ink)]" onClick={startTimer} title={`start the ${problem.timerMinutes}-minute countdown`}>
              <Timer size={14} className="inline mr-1 -mt-0.5" />
              start {problem.timerMinutes}:00
            </button>
          )
        )}
        {problem.levels.length > 1 && (
          <div className="pill px-4 py-1.5 font-bold text-[color:var(--ink)]" title="250 per level, like the real thing">
            {score}/1000
          </div>
        )}
        <button className="pill px-3 py-1.5 text-xs font-bold text-[color:var(--ink)]" onClick={resetProblem}>
          <RotateCcw size={12} className="inline mr-1" />reset
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <div className="bubble p-4">
          {problem.levels.length > 1 && (
            <div className="flex gap-1 mb-3">
              {problem.levels.map((l, i) => {
                const n = i + 1;
                const locked = n > unlocked;
                return (
                  <button
                    key={n}
                    className={`lvl ${n === level ? "on" : ""} ${locked ? "locked" : ""}`}
                    disabled={locked}
                    onClick={() => !locked && setLevel(n)}
                    title={locked ? "pass the previous level to unlock" : l.title}
                  >
                    {locked ? <Lock size={11} className="inline -mt-0.5 mr-1" /> : null}
                    Level {n}
                  </button>
                );
              })}
            </div>
          )}
          <div className="spec max-h-[460px] overflow-y-auto pr-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{`### ${lv.title}\n\n${lv.spec}`}</ReactMarkdown>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <CodeEditor value={code} onChange={saveCode} />
          <div className="flex gap-2">
            <button className="pill on px-5 py-2 font-bold text-[color:var(--ink)]" onClick={submit} disabled={running || engine === "loading"}>
              <Play size={14} className="inline mr-1 -mt-0.5" />
              {running ? "running…" : `run level ${level} tests`}
            </button>
            {engine === "loading" && <span className="text-xs text-amber-500 self-center font-bold">loading in-browser python…</span>}
          </div>
          {problem.id === "crawler" && level === 2 && engine === "pyodide" && (
            <div className="bubble p-3 text-xs font-bold text-amber-600 bg-[#fff7e0]">
              ⚠️ heads-up: you're on in-browser python (pyodide), and WASM can't start threads — real
              <code className="mx-1">threading</code> code will crash here. To actually exercise this level, run the
              local backend: <code>scripts/.venv-interview/bin/python scripts/interview_server.py</code>
            </div>
          )}

          {setupError && (
            <div className="bubble p-3 text-xs text-rose-600 whitespace-pre-wrap" style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
              {setupError}
            </div>
          )}
          {results && (
            <div className="bubble p-3 flex flex-col gap-1 max-h-72 overflow-y-auto">
              {results.map((r, i) => (
                <details key={i} className={`rounded-xl px-2 py-1 ${r.pass ? "bg-[#e9fbf2]" : "bg-[#ffecf0]"}`}>
                  <summary className="cursor-pointer text-[13px] font-bold flex items-center gap-2">
                    {r.pass ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-rose-500" />}
                    <span className={r.pass ? "text-emerald-700" : "text-rose-600"}>{r.name}</span>
                  </summary>
                  {!r.pass && (
                    <div className="text-[11.5px] mt-1 whitespace-pre-wrap" style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
                      {r.error ? (
                        <span className="text-rose-600">{r.error}</span>
                      ) : (
                        <>
                          <div className="text-[#5b4a66]">expected: {r.expected}</div>
                          <div className="text-rose-600">got: {r.got}</div>
                        </>
                      )}
                      {r.stdout && <div className="text-[color:var(--muted)]">stdout: {r.stdout}</div>}
                    </div>
                  )}
                </details>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConsolePanel engine={engine} />
    </div>
  );
}

const Interview = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>(problems[0].id);
  const [online, setOnline] = useState(false);
  const [pyState, setPyState] = useState<PyStatus>("idle");
  const [, setTick] = useState(0); // re-render after progress changes
  const bump = useCallback(() => setTick((t) => t + 1), []);
  const [tab, setTabState] = useState<Tab>(() => {
    const saved = localStorage.getItem(TAB_KEY);
    return TABS.includes(saved as Tab) ? (saved as Tab) : "anthropic";
  });
  const setTab = (t: Tab) => {
    localStorage.setItem(TAB_KEY, t);
    setTabState(t);
  };

  useEffect(() => {
    ensurePyodide(); // start pulling the WASM runtime right away; the backend overrides it if present
    return onPyStatus(setPyState);
  }, []);

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        const r = await fetch(`${api()}/health`);
        if (alive) setOnline((await r.json()).ok === true);
      } catch {
        if (alive) setOnline(false);
      }
    };
    ping();
    const t = setInterval(ping, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const engine: Engine = online ? "backend" : pyState === "ready" ? "pyodide" : "loading";

  const problem = problems.find((p) => p.id === selected) ?? problems[0];
  const stages: Problem["stage"][] = ["oa", "screening", "onsite"];
  const solvedCount = problems.filter(isSolved).length;
  const readingItems = readingSections.flatMap((s) => s.items);
  const readCount = readingItems.filter((i) => localStorage.getItem(readKey(i.id)) === "1").length;
  const jaxItems = jaxSections.flatMap((s) => s.items);
  const jaxDone = jaxItems.filter((i) => localStorage.getItem(jaxKey(i.id)) === "1").length;

  return (
    <div className={`interview min-h-screen theme-${tab}`}>
      <PageStyle />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <button className="pill px-4 py-1.5 font-bold text-[color:var(--ink)]" onClick={() => navigate("/")}>
            ← home
          </button>
          <h1 className="text-2xl font-bold text-[color:var(--ink)]">
            <Sparkles size={20} className="inline -mt-1 mr-1" />
            interview gym
          </h1>
          <div className="flex gap-1" role="tablist" aria-label="prep track">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`pill px-4 py-1.5 text-sm font-bold text-[color:var(--ink)] ${tab === t ? "on" : ""}`}
                onClick={() => setTab(t)}
                title={TAB_TITLE[t]}
              >
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {tab === "anthropic" && (
            <>
              <span className="pill px-3 py-1 text-xs font-bold text-[color:var(--ink)]">{solvedCount}/{problems.length} solved</span>
              <span
                className={`pill px-3 py-1 text-xs font-bold ${
                  engine === "backend" ? "text-emerald-600" : engine === "pyodide" ? "text-sky-600" : pyState === "error" ? "text-rose-500" : "text-amber-500"
                }`}
                title="the local backend (scripts/interview_server.py) adds real IPython and real threads; otherwise python runs in your browser via WASM"
              >
                {engine === "backend"
                  ? "engine: local IPython"
                  : engine === "pyodide"
                    ? "engine: pyodide (in-browser)"
                    : pyState === "error"
                      ? "python failed to load — refresh?"
                      : "loading python…"}
              </span>
            </>
          )}
          {tab === "deepmind" && <span className="pill px-3 py-1 text-xs font-bold text-[color:var(--ink)]">{readCount}/{readingItems.length} read</span>}
          {tab === "jax" && <span className="pill px-3 py-1 text-xs font-bold text-[color:var(--ink)]">{jaxDone}/{jaxItems.length} learned</span>}
        </div>

        {tab === "deepmind" ? (
          <DeepMindReadingList onProgress={bump} />
        ) : tab === "jax" ? (
          <JaxMathsTracker onProgress={bump} />
        ) : (
        <div className="grid md:grid-cols-[230px_1fr] gap-4 items-start">
          <div className="flex flex-col gap-3">
            {stages.map((st) => (
              <div key={st} className="bubble p-3">
                <div className="font-bold text-[color:var(--ink)] text-sm mb-2">{stageLabel[st]}</div>
                <div className="flex flex-col gap-1">
                  {problems
                    .filter((p) => p.stage === st)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelected(p.id)}
                        className={`text-left text-[12.5px] font-semibold rounded-xl px-2 py-1.5 flex items-center gap-1.5 transition-colors ${
                          p.id === selected ? "bg-gradient-to-r from-[color:var(--on1)] to-[color:var(--on2)] text-[color:var(--ink)]" : "text-[#5b4a66] hover:bg-[color:var(--soft)]"
                        }`}
                      >
                        {isSolved(p) ? (
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        ) : (
                          <ChevronRight size={13} className="shrink-0 opacity-50" />
                        )}
                        <span className="flex-1">{p.title}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <ProblemView problem={problem} engine={engine} onProgress={bump} />
        </div>
        )}
      </div>
    </div>
  );
};

export default Interview;
