import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Check, ArrowLeft } from "lucide-react";
import {
  oopWorlds,
  oopKey,
  oopLevels,
  oopXpTotal,
  worldXpTotal,
  XP,
  type OopWorld,
  type OopTaskKind,
} from "@/data/oop";

interface ProgressRow {
  key: string;
  done: boolean;
  notes: string;
  updated_at: string;
}

interface Props {
  progress: Record<string, ProgressRow>;
  saveProgress: (key: string, done: boolean, notes: string) => void;
}

const kindLabel: Record<OopTaskKind, { emoji: string; label: string }> = {
  ler: { emoji: "📖", label: "ler" },
  assistir: { emoji: "🎬", label: "assistir" },
  praticar: { emoji: "⚔️", label: "praticar" },
};

const worldPastels = [
  { bg: "#ffe4f1", border: "#f7b6d6" },
  { bg: "#ffeedd", border: "#f9c9a3" },
  { bg: "#fff8cf", border: "#f3e39a" },
  { bg: "#dcf8ea", border: "#a9e6c8" },
  { bg: "#def0ff", border: "#a9d3f7" },
  { bg: "#ece2ff", border: "#c9b4f5" },
  { bg: "#ffe0e6", border: "#f5aebb" },
  { bg: "#e2fbf7", border: "#a3e3d8" },
  { bg: "#fff0f6", border: "#f7b6d6" },
];

const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((100 * a) / b));

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const QuestStyle = () => (
  <style>{`
    .oop .world-card { transition: transform .12s ease; }
    .oop .world-card:not(:disabled):hover { transform: translateY(-3px) rotate(-0.5deg); }
    .oop .opt { border-radius: 18px; border: 2px solid #f3cde3; background: #fff; text-align: left; transition: transform .08s ease; }
    .oop .opt:not(:disabled):hover { transform: translateX(3px); border-color: #e6a9cf; }
    .oop .opt.right { background: #dcf8ea; border-color: #7fd6ab; }
    .oop .opt.wrong { background: #ffe0e6; border-color: #f5aebb; animation: oop-shake .35s; }
    .oop .badge { width: 52px; height: 52px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 2px solid #f3cde3; background: #fff; }
    .oop .badge.off { filter: grayscale(1); opacity: .35; }
    .oop .badge.on { background: linear-gradient(135deg, #fff1c2, #ffd3e8); border-color: #f3c76b; box-shadow: 0 3px 0 #f3d6a0; }
    .oop .xp { border-radius: 999px; padding: 1px 8px; font-size: 10px; font-weight: 700; background: #fff1c2; color: #8a6500; white-space: nowrap; }
    .oop .lesson code, .oop .lesson pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .oop .bounce { animation: oop-bounce 1.6s ease-in-out infinite; display: inline-block; }
    @keyframes oop-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }
    @keyframes oop-bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
    @keyframes oop-fall { to { transform: translateY(110vh) rotate(720deg); opacity: .7; } }
    .oop-confetti { position: fixed; top: -40px; z-index: 60; pointer-events: none; font-size: 22px; animation: oop-fall linear forwards; }
  `}</style>
);

const Confetti = ({ burst }: { burst: number }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1.6,
        ch: ["🌸", "⭐", "💖", "✨", "🎀", "🦄", "💜"][i % 7],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burst],
  );
  if (!burst) return null;
  return (
    <>
      {pieces.map((p, i) => (
        <span key={`${burst}-${i}`} className="oop-confetti" style={{ left: `${p.left}vw`, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}>
          {p.ch}
        </span>
      ))}
    </>
  );
};

const OopQuest = ({ progress, saveProgress }: Props) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [burst, setBurst] = useState(0);

  const isDone = (k: string) => !!progress[k]?.done;

  // ---------- scoring ----------
  const worldStats = (w: OopWorld) => {
    const tasks = w.tasks.filter((t) => isDone(oopKey(w, t.id)));
    const quiz = w.quiz.filter((q) => isDone(oopKey(w, q.id))).length;
    const steps = w.challenge.steps.filter((s) => isDone(oopKey(w, s.id))).length;
    const xp = tasks.reduce((n, t) => n + t.xp, 0) + quiz * XP.quiz + steps * XP.step;
    const total = worldXpTotal(w);
    return {
      xp,
      total,
      tasksDone: tasks.length,
      quiz,
      steps,
      stars: (tasks.length === w.tasks.length ? 1 : 0) + (quiz === w.quiz.length ? 1 : 0) + (steps === w.challenge.steps.length ? 1 : 0),
      complete: xp === total,
    };
  };

  const stats = oopWorlds.map(worldStats);
  const xp = stats.reduce((n, s) => n + s.xp, 0);
  const levelIdx = oopLevels.reduce((idx, l, i) => (xp >= l.minXp ? i : idx), 0);
  const level = oopLevels[levelIdx];
  const nextLevel = oopLevels[levelIdx + 1];

  // streak: consecutive days with at least one oop check, ending today or yesterday
  const streak = useMemo(() => {
    const days = new Set(
      Object.values(progress)
        .filter((r) => r.key.startsWith("oop:") && r.done)
        .map((r) => dayKey(new Date(r.updated_at))),
    );
    const d = new Date();
    if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (days.has(dayKey(d))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [progress]);

  // ---------- badges ----------
  const countKind = (kind: OopTaskKind) =>
    oopWorlds.reduce((n, w) => n + w.tasks.filter((t) => t.kind === kind && isDone(oopKey(w, t.id))).length, 0);
  const quizRight = stats.reduce((n, s) => n + s.quiz, 0);
  const worldsDone = stats.filter((s) => s.complete).length;
  const badges = [
    { emoji: "🌱", name: "Primeiro passo", how: "marque qualquer coisa", on: xp > 0 },
    { emoji: "🧠", name: "Cabeça de quiz", how: "acerte 10 perguntas", on: quizRight >= 10 },
    { emoji: "💯", name: "Gabaritou", how: "acerte todo o quiz de um mundo", on: oopWorlds.some((w, i) => stats[i].quiz === w.quiz.length) },
    { emoji: "🛠️", name: "Mão na massa", how: "termine um desafio", on: oopWorlds.some((w, i) => stats[i].steps === w.challenge.steps.length) },
    { emoji: "📚", name: "Rato de biblioteca", how: "leia 10 textos", on: countKind("ler") >= 10 },
    { emoji: "🍿", name: "Maratonista", how: "assista 5 vídeos", on: countKind("assistir") >= 5 },
    { emoji: "⚔️", name: "LeetCoder", how: "resolva 3 problemas", on: countKind("praticar") >= 3 },
    { emoji: "🔥", name: "Em chamas", how: "3 dias seguidos estudando", on: streak >= 3 },
    { emoji: "🏰", name: "Meio do mapa", how: "complete 5 mundos", on: worldsDone >= 5 },
    { emoji: "👑", name: "Zerou o jogo", how: "complete todos os mundos", on: worldsDone === oopWorlds.length },
  ];

  // celebrate level-ups and finished worlds, but not what was already true on load
  const prev = useRef<{ level: number; worlds: number } | null>(null);
  useEffect(() => {
    if (prev.current === null) {
      if (Object.keys(progress).length) prev.current = { level: levelIdx, worlds: worldsDone };
      return;
    }
    if (worldsDone > prev.current.worlds) {
      setBurst(Date.now());
      toast.success("Mundo completo! 🎉 você é demais");
    } else if (levelIdx > prev.current.level) {
      setBurst(Date.now());
      toast.success(`Subiu de nível! ${oopLevels[levelIdx].emoji} ${oopLevels[levelIdx].name}`);
    }
    prev.current = { level: levelIdx, worlds: worldsDone };
  }, [levelIdx, worldsDone, progress]);

  const toggle = (k: string, gain: number) => {
    const now = !isDone(k);
    saveProgress(k, now, "");
    if (now) toast(`+${gain} XP ✨`, { duration: 1200 });
  };

  const answer = (w: OopWorld, qid: string, i: number, correct: number) => {
    const k = oopKey(w, qid);
    if (isDone(k)) return;
    setPicked((p) => ({ ...p, [k]: i }));
    if (i === correct) {
      saveProgress(k, true, "");
      toast(`Acertou! +${XP.quiz} XP 🎯`, { duration: 1400 });
    }
  };

  const world = oopWorlds.find((w) => w.id === openId);

  // ---------- world detail ----------
  if (world) {
    const wi = oopWorlds.indexOf(world);
    const s = stats[wi];
    const pastel = worldPastels[wi % worldPastels.length];
    const tinted = { background: pastel.bg, borderColor: pastel.border, boxShadow: `0 6px 0 ${pastel.border}` };
    return (
      <div className="oop space-y-4">
        <QuestStyle />
        <Confetti burst={burst} />

        <div className="bubble p-4 sm:p-6" style={tinted}>
          <button onClick={() => setOpenId(null)} className="pill px-3 py-1 text-xs font-bold inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> mapa
          </button>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-5xl bounce">{world.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-[#a67a9c]">mundo {wi + 1}</div>
              <h2 className="text-xl font-bold text-[#c2407f]">{world.name}</h2>
              <div className="text-sm italic text-[#7a5a74]">{world.tagline}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg">{"⭐".repeat(s.stars)}{"☆".repeat(3 - s.stars)}</div>
              <div className="text-xs font-bold">
                {s.xp}/{s.total} XP
              </div>
            </div>
          </div>
          <div className="bar mt-3" style={{ background: "#ffffffaa" }}>
            <div style={{ width: `${pct(s.xp, s.total)}%` }} />
          </div>
        </div>

        {/* lição */}
        <div className="bubble p-4 sm:p-6 lesson">
          <h3 className="font-bold text-[#c2407f] mb-3">📖 lição</h3>
          <div className="space-y-3 text-sm leading-relaxed">
            {world.lesson.map((b, i) =>
              "p" in b ? (
                <p key={i}>{b.p}</p>
              ) : "code" in b ? (
                <pre key={i} className="p-3 sm:p-4 text-[12px] overflow-x-auto whitespace-pre">
                  {b.code}
                </pre>
              ) : (
                <div key={i} className="rounded-2xl bg-[#fff8cf] border-2 border-[#f3e39a] p-3 text-[13px]">
                  💡 {b.tip}
                </div>
              ),
            )}
          </div>
        </div>

        {/* missões */}
        <div className="bubble p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#c2407f]">🎯 missões</h3>
            <span className="text-xs font-bold text-[#a67a9c]">
              {s.tasksDone}/{world.tasks.length} {s.tasksDone === world.tasks.length && "⭐"}
            </span>
          </div>
          <ul className="space-y-2 mt-3">
            {world.tasks.map((t) => {
              const k = oopKey(world, t.id);
              const done = isDone(k);
              return (
                <li key={t.id} className="flex items-center gap-3 text-sm">
                  <button onClick={() => toggle(k, t.xp)} aria-label={done ? "desmarcar" : "marcar"} className={`check ${done ? "on" : ""}`}>
                    {done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </button>
                  <span className="text-base" title={kindLabel[t.kind].label}>
                    {kindLabel[t.kind].emoji}
                  </span>
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex-1 min-w-0 hover:underline inline-flex items-center gap-1 ${done ? "line-through text-[#a67a9c]" : "font-semibold"}`}
                  >
                    {t.title}
                    <ExternalLink className="w-3 h-3 shrink-0 text-[#c2407f]" />
                  </a>
                  <span className="xp">+{t.xp} XP</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* quiz */}
        <div className="bubble p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#c2407f]">❓ quiz</h3>
            <span className="text-xs font-bold text-[#a67a9c]">
              {s.quiz}/{world.quiz.length} {s.quiz === world.quiz.length && "⭐"}
            </span>
          </div>
          <div className="space-y-5 mt-3">
            {world.quiz.map((q, qi) => {
              const k = oopKey(world, q.id);
              const solved = isDone(k);
              const pick = picked[k];
              return (
                <div key={q.id}>
                  <div className="text-sm font-bold mb-2">
                    {qi + 1}. {q.q} {!solved && <span className="xp ml-1">+{XP.quiz} XP</span>}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((o, oi) => {
                      const cls = solved && oi === q.answer ? "right" : !solved && pick === oi ? "wrong" : "";
                      return (
                        <button key={`${oi}-${pick === oi ? pick : ""}`} disabled={solved} onClick={() => answer(world, q.id, oi, q.answer)} className={`opt px-3 py-2 text-[13px] ${cls}`}>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                  {solved ? (
                    <div className="text-xs text-[#1f6b48] mt-2">✅ {q.why}</div>
                  ) : pick !== undefined ? (
                    <div className="text-xs text-[#b2475e] mt-2">quase! tenta de novo 💪</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* desafio */}
        <div className="bubble p-4 sm:p-6" style={tinted}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#c2407f]">🏆 {world.challenge.title}</h3>
            <span className="text-xs font-bold text-[#a67a9c]">
              {s.steps}/{world.challenge.steps.length} {s.steps === world.challenge.steps.length && "⭐"}
            </span>
          </div>
          <p className="text-sm mt-1 text-[#7a5a74]">{world.challenge.brief}</p>
          <ul className="space-y-2 mt-3 rounded-3xl bg-white/70 p-3 sm:p-4">
            {world.challenge.steps.map((st) => {
              const k = oopKey(world, st.id);
              const done = isDone(k);
              return (
                <li key={st.id} className="flex items-center gap-3 text-sm">
                  <button onClick={() => toggle(k, XP.step)} aria-label={done ? "desmarcar" : "marcar"} className={`check ${done ? "on" : ""}`}>
                    {done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </button>
                  <span className={`flex-1 ${done ? "line-through text-[#a67a9c]" : ""}`}>{st.text}</span>
                  <span className="xp">+{XP.step} XP</span>
                </li>
              );
            })}
          </ul>
        </div>

        {wi + 1 < oopWorlds.length && (
          <button onClick={() => setOpenId(oopWorlds[wi + 1].id)} className="pill on w-full py-3 font-bold text-[#8a2f5e]">
            próximo mundo: {oopWorlds[wi + 1].emoji} {oopWorlds[wi + 1].name} →
          </button>
        )}
      </div>
    );
  }

  // ---------- map ----------
  return (
    <div className="oop space-y-4">
      <QuestStyle />
      <Confetti burst={burst} />

      <div className="bubble p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="text-5xl bounce">{level.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-[#a67a9c]">POO para estágio · nível {levelIdx + 1}</div>
            <div className="text-xl font-bold text-[#c2407f]">{level.name}</div>
            <div className="bar mt-2">
              <div style={{ width: `${nextLevel ? pct(xp - level.minXp, nextLevel.minXp - level.minXp) : 100}%` }} />
            </div>
            <div className="text-[11px] text-[#a67a9c] mt-1">
              {nextLevel ? `${nextLevel.minXp - xp} XP para ${nextLevel.emoji} ${nextLevel.name}` : "nível máximo, você zerou! 🌟"}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="rounded-2xl bg-[#fff1c2] p-2">
            <div className="text-lg font-bold">✨ {xp}</div>
            <div className="text-[10px] font-bold text-[#8a6500]">de {oopXpTotal} XP</div>
          </div>
          <div className="rounded-2xl bg-[#ffe0e6] p-2">
            <div className="text-lg font-bold">🔥 {streak}</div>
            <div className="text-[10px] font-bold text-[#b2475e]">{streak === 1 ? "dia seguido" : "dias seguidos"}</div>
          </div>
          <div className="rounded-2xl bg-[#dcf8ea] p-2">
            <div className="text-lg font-bold">🗺️ {worldsDone}</div>
            <div className="text-[10px] font-bold text-[#1f6b48]">de {oopWorlds.length} mundos</div>
          </div>
        </div>
      </div>

      <div className="bubble p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#c2407f]">🏅 conquistas</h3>
          <span className="text-xs font-bold text-[#a67a9c]">
            {badges.filter((b) => b.on).length}/{badges.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {badges.map((b) => (
            <div key={b.name} className="flex flex-col items-center w-[72px] text-center" title={b.how}>
              <div className={`badge ${b.on ? "on" : "off"}`}>{b.emoji}</div>
              <div className="text-[10px] font-bold mt-1 leading-tight">{b.name}</div>
              {!b.on && <div className="text-[9px] text-[#a67a9c] leading-tight">{b.how}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {oopWorlds.map((w, i) => {
          const s = stats[i];
          const pastel = worldPastels[i % worldPastels.length];
          return (
            <button
              key={w.id}
              onClick={() => {
                setOpenId(w.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bubble world-card p-4 text-left"
              style={{ background: pastel.bg, borderColor: pastel.border, boxShadow: `0 6px 0 ${pastel.border}` }}
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{w.emoji}</span>
                <span className="text-sm">
                  {"⭐".repeat(s.stars)}
                  <span className="opacity-30">{"⭐".repeat(3 - s.stars)}</span>
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#a67a9c] mt-2">mundo {i + 1}</div>
              <div className="font-bold">
                {s.complete ? "✓ " : ""}
                {w.name}
              </div>
              <div className="text-xs italic text-[#7a5a74]">{w.tagline}</div>
              <div className="bar mt-3" style={{ background: "#ffffffaa", height: 8 }}>
                <div style={{ width: `${pct(s.xp, s.total)}%` }} />
              </div>
              <div className="text-[10px] font-bold text-[#a67a9c] mt-1">
                {s.xp}/{s.total} XP
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OopQuest;
