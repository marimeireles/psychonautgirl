import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ManifoldPeerReview } from "@/components/ManifoldPeerReview";
import {
  SHOW_DRAFT_NOTES,
  manifoldAuthor,
  manifoldInspiration,
  manifoldPdf,
  manifoldSummary,
  manifoldRefs,
  manifoldSections,
  manifoldTitle,
} from "@/data/manifold";

/* ------------------------------------------------------------------ */
/* Constellations                                                      */
/* ------------------------------------------------------------------ */

type Pt = [number, number];

interface Constellation {
  id: string;
  name: string;
  gloss: string;
  wiki: string;
  pts: Pt[];
  /** apparent magnitude of each star: lower is brighter */
  mags: number[];
  edges: [number, number][];
}

const TAU = Math.PI * 2;
const wiki = (slug: string) => `https://en.wikipedia.org/wiki/${slug}`;

// Real constellations. `gloss` is the idea each one stands for on this page; `wiki` is the article that
// explains why that constellation carries that idea (its myth or symbol), not the idea itself.
// Each star is [right ascension (hours), declination (degrees), magnitude];
// edges index into the star list. Positions are projected onto a flat patch of sky below.
type SkyStar = [number, number, number];
interface SkyDef {
  id: string;
  name: string;
  gloss: string;
  wiki: string;
  stars: SkyStar[];
  edges: [number, number][];
}

const SKY: SkyDef[] = [
  {
    // the maiden holding an ear of wheat (Spica): harvest, abundance
    id: "virgo",
    name: "Virgo",
    gloss: "flourishing",
    wiki: wiki("Astraea"),
    stars: [
      [13.42, -11.16, 0.98], // 0 Spica
      [12.694, -1.45, 2.75], // 1 Porrima
      [13.036, 10.96, 2.85], // 2 Vindemiatrix
      [13.578, -0.6, 3.4], // 3 Heze
      [12.927, 3.4, 3.4], // 4 Minelauva
      [11.845, 1.76, 3.6], // 5 Zavijava
      [12.332, -0.67, 3.9], // 6 Zaniah
      [13.166, -5.54, 4.4], // 7 theta
      [14.267, -6.0, 4.1], // 8 Syrma
      [14.718, -5.66, 3.9], // 9 mu
      [14.027, 1.54, 4.25], // 10 tau
      [14.771, 1.89, 3.7], // 11 109 Vir
    ],
    edges: [[5, 6], [6, 1], [1, 4], [4, 2], [1, 7], [7, 0], [4, 3], [3, 10], [10, 11], [3, 8], [8, 9]],
  },
  {
    // the archer centaur, often told as a wise teacher
    id: "sagittarius",
    name: "Sagittarius",
    gloss: "wisdom",
    wiki: wiki("Chiron"),
    stars: [
      [18.403, -34.38, 1.85], // 0 Kaus Australis
      [18.35, -29.83, 2.7], // 1 Kaus Media
      [18.466, -25.42, 2.8], // 2 Kaus Borealis
      [18.097, -30.42, 3.0], // 3 Alnasl
      [18.921, -26.3, 2.05], // 4 Nunki
      [18.761, -26.99, 3.2], // 5 phi
      [19.044, -29.88, 2.6], // 6 Ascella
      [19.116, -27.67, 3.3], // 7 tau
      [19.163, -21.02, 2.9], // 8 pi
      [19.078, -21.74, 3.8], // 9 omicron
      [18.962, -21.11, 3.5], // 10 xi2
      [18.229, -21.06, 3.85], // 11 mu
    ],
    edges: [[3, 1], [1, 0], [0, 3], [1, 2], [2, 5], [5, 1], [5, 4], [4, 7], [7, 6], [6, 5], [6, 0], [2, 11], [4, 9], [9, 8], [9, 10]],
  },
  {
    // the scales
    id: "libra",
    name: "Libra",
    gloss: "practical wisdom",
    wiki: wiki("Golden_mean_(philosophy)"),
    stars: [
      [14.848, -16.04, 2.75], // 0 Zubenelgenubi
      [15.283, -9.38, 2.6], // 1 Zubeneschamali
      [15.592, -14.79, 3.9], // 2 gamma
      [15.068, -25.28, 3.3], // 3 sigma
      [15.617, -28.13, 3.6], // 4 upsilon
      [15.644, -29.78, 3.7], // 5 tau
    ],
    edges: [[0, 1], [1, 2], [2, 0], [0, 3], [2, 4], [4, 5]],
  },
  {
    // the lyre of Orpheus: the music of the spheres
    id: "lyra",
    name: "Lyra",
    gloss: "harmony",
    wiki: wiki("Orpheus"),
    stars: [
      [18.615, 38.78, 0.03], // 0 Vega
      [18.74, 39.6, 4.7], // 1 epsilon
      [18.746, 37.6, 4.3], // 2 zeta
      [18.908, 36.9, 4.3], // 3 delta
      [18.982, 32.69, 3.25], // 4 Sulafat
      [18.835, 33.36, 3.5], // 5 Sheliak
    ],
    edges: [[0, 1], [1, 2], [0, 2], [2, 3], [3, 4], [4, 5], [5, 2]],
  },
  {
    // the twins: two lives bound into one
    id: "gemini",
    name: "Gemini",
    gloss: "becoming by living together",
    wiki: wiki("Castor_and_Pollux"),
    stars: [
      [7.577, 31.89, 1.58], // 0 Castor
      [7.755, 28.03, 1.14], // 1 Pollux
      [6.629, 16.4, 1.93], // 2 Alhena
      [6.383, 22.51, 2.9], // 3 mu
      [6.732, 25.13, 3.0], // 4 Mebsuta
      [6.248, 22.51, 3.3], // 5 Propus
      [6.754, 12.9, 3.35], // 6 Alzirr
      [7.335, 21.98, 3.5], // 7 Wasat
      [7.741, 24.4, 3.6], // 8 kappa
      [7.301, 16.54, 3.6], // 9 lambda
      [7.068, 20.57, 3.8], // 10 Mekbuda
      [7.186, 30.25, 4.4], // 11 tau
      [7.599, 26.9, 4.1], // 12 upsilon
    ],
    edges: [[0, 11], [11, 4], [4, 3], [3, 5], [1, 12], [12, 7], [7, 10], [10, 2], [7, 9], [9, 6], [0, 1], [1, 8]],
  },
  {
    // the serpent bearer, the healer Asclepius: a body that mends and remakes itself
    id: "ophiuchus",
    name: "Ophiuchus",
    gloss: "self-making",
    wiki: wiki("Rod_of_Asclepius"),
    stars: [
      [17.582, 12.56, 2.08], // 0 Rasalhague
      [17.725, 4.57, 2.77], // 1 Cebalrai
      [17.798, 2.71, 3.75], // 2 gamma
      [16.961, 9.38, 3.2], // 3 kappa
      [16.239, -3.69, 2.75], // 4 Yed Prior
      [16.305, -4.69, 3.2], // 5 Yed Posterior
      [16.619, -10.57, 2.55], // 6 zeta
      [17.173, -15.72, 2.43], // 7 Sabik
      [17.984, -9.77, 3.3], // 8 nu
      [17.367, -25.0, 3.25], // 9 theta
      [16.515, 1.98, 3.8], // 10 Marfik
    ],
    edges: [[0, 1], [1, 7], [7, 6], [6, 5], [5, 4], [4, 10], [10, 3], [3, 0], [1, 2], [2, 8], [7, 9]],
  },
  {
    // the little bear, holding the pole star the whole sky turns around
    id: "ursa-minor",
    name: "Ursa Minor",
    gloss: "intellect",
    wiki: wiki("Unmoved_mover"),
    stars: [
      [2.53, 89.26, 2.0], // 0 Polaris
      [17.537, 86.59, 4.35], // 1 Yildun
      [16.766, 82.04, 4.2], // 2 epsilon
      [15.734, 77.79, 4.3], // 3 zeta
      [14.845, 74.16, 2.07], // 4 Kochab
      [15.345, 71.83, 3.0], // 5 Pherkad
      [16.292, 75.76, 4.95], // 6 eta
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
  },
  {
    // the hero who chose the hard road of virtue
    id: "hercules",
    name: "Hercules",
    gloss: "excellence",
    wiki: wiki("Hercules_at_the_crossroads"),
    stars: [
      [17.005, 30.93, 3.9], // 0 epsilon
      [16.688, 31.6, 2.8], // 1 zeta
      [16.715, 38.92, 3.5], // 2 eta
      [17.251, 36.81, 3.15], // 3 pi
      [16.504, 21.49, 2.77], // 4 Kornephoros
      [17.244, 14.39, 3.1], // 5 Rasalgethi
      [17.251, 24.84, 3.1], // 6 Sarin
      [16.365, 19.15, 3.75], // 7 gamma
      [17.658, 46.01, 3.8], // 8 iota
      [17.938, 37.25, 3.85], // 9 theta
      [16.329, 46.31, 3.9], // 10 tau
      [16.568, 42.44, 4.2], // 11 sigma
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [4, 7], [0, 6], [6, 5], [2, 11], [11, 10], [3, 9], [9, 8]],
  },
  {
    // the winged horse whose hoof opened the spring of the Muses
    id: "pegasus",
    name: "Pegasus",
    gloss: "creativity",
    wiki: wiki("Hippocrene"),
    stars: [
      [0.14, 29.09, 2.06], // 0 Alpheratz
      [23.063, 28.08, 2.4], // 1 Scheat
      [23.079, 15.21, 2.5], // 2 Markab
      [0.221, 15.18, 2.8], // 3 Algenib
      [21.736, 9.88, 2.4], // 4 Enif
      [22.17, 6.2, 3.5], // 5 Biham
      [22.691, 10.83, 3.4], // 6 Homam
      [22.717, 30.22, 2.9], // 7 Matar
      [22.167, 33.18, 4.3], // 8 pi
      [22.833, 24.6, 3.5], // 9 mu
      [22.775, 23.57, 3.95], // 10 lambda
      [22.117, 25.35, 3.8], // 11 iota
      [21.744, 25.65, 4.1], // 12 kappa
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 6], [6, 5], [5, 4], [1, 7], [7, 8], [1, 9], [9, 10], [10, 11], [11, 12]],
  },
  {
    // the dolphin
    id: "delphinus",
    name: "Delphinus",
    gloss: "intelligence",
    wiki: wiki("Cetacean_intelligence"),
    stars: [
      [20.661, 15.91, 3.8], // 0 Sualocin
      [20.626, 14.6, 3.6], // 1 Rotanev
      [20.778, 16.12, 3.9], // 2 gamma
      [20.724, 15.07, 4.4], // 3 delta
      [20.554, 11.3, 4.0], // 4 epsilon
    ],
    edges: [[0, 1], [1, 3], [3, 2], [2, 0], [1, 4]],
  },
];

// Gnomonic projection around each constellation's centre (north up, east to the left, as seen
// from Earth), then fitted into a 100x100 box.
const project = (def: SkyDef): Constellation => {
  const rad = Math.PI / 180;
  const vec = def.stars.map(([ra, dec]) => {
    const a = ra * 15 * rad, d = dec * rad;
    return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
  });
  const m = [0, 1, 2].map((k) => vec.reduce((s, v) => s + v[k], 0));
  const ra0 = Math.atan2(m[1], m[0]);
  const dec0 = Math.atan2(m[2], Math.hypot(m[0], m[1]));
  const flat = def.stars.map(([ra, dec]) => {
    const a = ra * 15 * rad - ra0, d = dec * rad;
    const c = Math.sin(dec0) * Math.sin(d) + Math.cos(dec0) * Math.cos(d) * Math.cos(a);
    const x = (Math.cos(d) * Math.sin(a)) / c;
    const y = (Math.cos(dec0) * Math.sin(d) - Math.sin(dec0) * Math.cos(d) * Math.cos(a)) / c;
    return [-x, -y];
  });
  const xs = flat.map((p) => p[0]), ys = flat.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const k = 100 / Math.max(maxX - minX, maxY - minY);
  const pts = flat.map(
    ([x, y]) => [50 + (x - (minX + maxX) / 2) * k, 50 + (y - (minY + maxY) / 2) * k] as Pt,
  );
  return { id: def.id, name: def.name, gloss: def.gloss, wiki: def.wiki, pts, mags: def.stars.map((s) => s[2]), edges: def.edges };
};

// order down the page; anything not listed follows in the order it is defined above
const ORDER = ["hercules", "pegasus", "ophiuchus", "delphinus"];
const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length);
const CONSTELLATIONS: Constellation[] = SKY.map(project).sort((a, b) => rank(a.id) - rank(b.id));

// deterministic per-star variety
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
};

const ConstellationLink = ({ c, className = "", style }: { c: Constellation; className?: string; style?: React.CSSProperties }) => (
  <a
    href={c.wiki}
    target="_blank"
    rel="noopener noreferrer"
    className={`poi-const ${className}`}
    style={style}
    aria-label={`${c.name}: ${c.gloss} (opens Wikipedia)`}
  >
    <svg
      viewBox="-6 -6 112 112"
      aria-hidden="true"
      style={{ transform: `rotate(${(hash(c.id + "rot") - 0.5) * 10}deg) scale(${0.78 + hash(c.id + "size") * 0.3})` }}
    >
      <g className="poi-lines">
        {c.edges.map(([a, b], i) => (
          <line key={i} x1={c.pts[a][0]} y1={c.pts[a][1]} x2={c.pts[b][0]} y2={c.pts[b][1]} />
        ))}
      </g>
      <g className="poi-stars">
        {c.pts.map(([x, y], i) => {
          // size and brightness follow the star's real magnitude; the brightest get a flare
          const mag = c.mags[i];
          const b = Math.min(1, Math.max(0, (4.8 - mag) / 4.8)); // 0 faint .. 1 brilliant
          const flare = mag < 2.2;
          const r = 0.55 + b * 1.9;
          const o = 0.3 + b * 0.55;
          const blue = hash(c.id + "b" + i) < 0.28;
          const L = r * 4.2;
          const vars = {
            "--o": o,
            transitionDelay: `${i * 18}ms`,
            animationDelay: `${-hash(c.id + "t" + i) * 7}s`,
            animationDuration: `${3.5 + hash(c.id + "d" + i) * 5}s`,
          } as React.CSSProperties;
          return (
            <g key={i} className={`poi-star${blue ? " is-blue" : ""}`} style={vars}>
              {flare && (
                <path className="poi-flare" d={`M${x - L} ${y}H${x + L}M${x} ${y - L}V${y + L}`} />
              )}
              <circle cx={x} cy={y} r={r} />
            </g>
          );
        })}
      </g>
    </svg>
    <span className="poi-tag poi-metal">
      <span className="poi-tag-name">{c.name}</span>
      <span className="poi-tag-gloss">{c.gloss} ↗</span>
    </span>
  </a>
);

/* ------------------------------------------------------------------ */
/* Starfield                                                           */
/* ------------------------------------------------------------------ */

const Starfield = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type Star = { x: number; y: number; r: number; a: number; tw: number; ph: number; depth: number; blue: boolean; flare: boolean };
    let stars: Star[] = [];
    let w = 0, h = 0, raf = 0;

    // now and then, a falling star
    type Meteor = { x: number; y: number; dx: number; dy: number; len: number; t0: number; dur: number };
    let meteor: Meteor | null = null;
    let nextMeteor = performance.now() + 2500 + Math.random() * 4000;
    const spawnMeteor = (t: number) => {
      const dir = Math.random() < 0.5 ? 1 : -1; // falls towards the right or the left
      const angle = (20 + Math.random() * 30) * (Math.PI / 180); // below the horizontal
      const speed = 620 + Math.random() * 420; // px per second
      meteor = {
        x: w * (0.5 - dir * (0.1 + Math.random() * 0.4)),
        y: h * (0.04 + Math.random() * 0.4),
        dx: Math.cos(angle) * speed * dir,
        dy: Math.sin(angle) * speed,
        len: 110 + Math.random() * 120,
        t0: t,
        dur: 650 + Math.random() * 500,
      };
      nextMeteor = t + 7000 + Math.random() * 14000;
    };
    const drawMeteor = (t: number) => {
      if (!meteor) {
        if (t > nextMeteor && !document.hidden) spawnMeteor(t);
        return;
      }
      const p = (t - meteor.t0) / meteor.dur;
      if (p >= 1) {
        meteor = null;
        return;
      }
      const e = (t - meteor.t0) / 1000;
      const hx = meteor.x + meteor.dx * e, hy = meteor.y + meteor.dy * e;
      const sp = Math.hypot(meteor.dx, meteor.dy);
      const tx = hx - (meteor.dx / sp) * meteor.len, ty = hy - (meteor.dy / sp) * meteor.len;
      const fade = Math.sin(Math.PI * p); // in, then out
      const g = ctx.createLinearGradient(hx, hy, tx, ty);
      g.addColorStop(0, `rgba(240,247,255,${0.9 * fade})`);
      g.addColorStop(0.25, `rgba(140,195,255,${0.45 * fade})`);
      g.addColorStop(1, "rgba(95,178,255,0)");
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${0.95 * fade})`;
      ctx.beginPath();
      ctx.arc(hx, hy, 1.5, 0, TAU);
      ctx.fill();
    };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 950);
      stars = Array.from({ length: n }, () => {
        const roll = Math.random();
        const flare = roll < 0.012;
        const big = roll < 0.08;
        return {
          blue: Math.random() < 0.22,
          flare,
          x: Math.random() * w,
          y: Math.random() * h,
          r: flare ? 1.3 + Math.random() * 0.5 : big ? 0.9 + Math.random() * 0.5 : 0.3 + Math.random() * 0.55,
          a: flare ? 0.7 + Math.random() * 0.2 : big ? 0.45 + Math.random() * 0.25 : 0.1 + Math.random() * 0.3,
          tw: 0.2 + Math.random() * 0.6,
          ph: Math.random() * TAU,
          depth: 0.02 + Math.random() * 0.06,
        };
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const sy = window.scrollY;
      for (const s of stars) {
        const tw = still ? 1 : 0.7 + 0.3 * Math.sin(s.ph + (t / 1000) * s.tw);
        let y = (s.y - sy * s.depth) % h;
        if (y < 0) y += h;
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = s.blue ? "#8fc2ff" : "#e3e9f0";
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, TAU);
        ctx.fill();
        if (s.flare) {
          const L = s.r * 5;
          ctx.globalAlpha = s.a * tw * 0.45;
          ctx.fillRect(s.x - L, y - 0.25, L * 2, 0.5);
          ctx.fillRect(s.x - 0.25, y - L, 0.5, L * 2);
        }
      }
      ctx.globalAlpha = 1;
      if (!still) {
        drawMeteor(t);
        raf = requestAnimationFrame(draw);
      }
    };

    build();
    raf = requestAnimationFrame(draw);
    const onResize = () => {
      build();
      if (still) draw(0);
    };
    const onScroll = () => {
      if (still) draw(0);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={ref} className="poi-canvas" aria-hidden="true" />;
};

/* ------------------------------------------------------------------ */
/* Meteor cursor: a bright head with a tail that burns out behind it   */
/* ------------------------------------------------------------------ */

const MeteorCursor = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const LIFE = 320; // ms a point of the tail stays alight
    let pts: { x: number; y: number; t: number }[] = [];
    let raf = 0;
    let w = 0, h = 0;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = () => {
      raf = 0;
      const now = performance.now();
      pts = pts.filter((p) => now - p.t < LIFE);
      ctx.clearRect(0, 0, w, h);
      if (pts.length < 2) return;
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const k = 1 - (now - b.t) / LIFE; // 1 at the head, 0 at the end of the tail
        // wide soft blue halo, then a thin white-hot core
        ctx.strokeStyle = `rgba(95,178,255,${0.07 * k * k})`;
        ctx.lineWidth = 2 + 13 * k;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.strokeStyle = `rgba(235,244,255,${0.3 * k * k})`;
        ctx.lineWidth = 0.8 + 3.2 * k;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      const head = pts[pts.length - 1];
      const k = 1 - (now - head.t) / LIFE;
      const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 14);
      g.addColorStop(0, `rgba(255,255,255,${0.4 * k})`);
      g.addColorStop(0.18, `rgba(170,215,255,${0.22 * k})`);
      g.addColorStop(1, "rgba(95,178,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(head.x, head.y, 14, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (pts.length > 90) pts.shift();
      if (!raf) raf = requestAnimationFrame(frame);
    };

    size();
    window.addEventListener("resize", size);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="poi-meteor" aria-hidden="true" />;
};

/* ------------------------------------------------------------------ */
/* Metal textures                                                      */
/* ------------------------------------------------------------------ */

// MetalliCSS makes metal by bending a studio reflection photo over the shape of a box. Here it
// renders one such surface offscreen and the result comes back as an image, to be reused where
// the library can't reach by itself: inside an SVG drawing, or as the fill of letters.
const metalTexture = (w: number, h: number, radius: number, metal: string, convexity: number) =>
  new Promise<string | null>((resolve) => {
    const box = document.createElement("div");
    box.style.cssText = `position:fixed;left:-3000px;top:0;width:${w}px;height:${h}px;border-radius:${radius}px;background:#8a95a1;overflow:hidden;--metal:${metal};--convexity:${convexity}`;
    document.body.appendChild(box);
    const done = (url: string | null) => {
      box.remove();
      resolve(url);
    };
    const grab = (tries: number) => {
      const canvas = box.querySelector("canvas");
      try {
        // the library paints asynchronously; a still-blank canvas reads as pure black
        const px = canvas?.getContext("2d")?.getImageData(canvas.width >> 1, canvas.height >> 2, 1, 1).data;
        if (canvas && px && px[0] + px[1] + px[2] > 0) return done(canvas.toDataURL("image/jpeg", 0.92));
      } catch {
        return done(null); // canvas not readable in this browser
      }
      if (tries > 0) window.setTimeout(() => grab(tries - 1), 250);
      else done(null);
    };
    import("metallicss").then(
      ({ metallicss }) => {
        metallicss(box);
        window.setTimeout(() => grab(12), 250);
      },
      () => done(null),
    );
  });

/* ------------------------------------------------------------------ */
/* Horizon: the limb of a world its civilization has built out into    */
/* space, seen from orbit. Drawn procedurally, so it is an original.   */
/* ------------------------------------------------------------------ */

const mulberry = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const ANGEL_LINK = "https://x.com/Grimezsz/status/2116320037896347905";

const HorizonScene = () => {
  const scene = useMemo(() => {
    const rnd = mulberry(7);
    const W = 1600, H = 560;
    const C = { x: 800, y: 2900 }, R = 2560; // the planet: a huge circle, only its top shows
    const f = (n: number) => n.toFixed(1);

    // light beaming out of the planet where the figure rises: a fan of rays from one point on the limb
    const O = { x: C.x, y: C.y - R + 6 };
    const rays = Array.from({ length: 64 }, (_, i) => {
      const a = -Math.PI / 2 + ((i + 0.5) / 64 - 0.5) * 2.75 + (rnd() - 0.5) * 0.03;
      const strong = i % 4 === 0;
      const r0 = 0, r1 = (strong ? 560 : 300) + rnd() * 260;
      return {
        d: `M${f(O.x + Math.cos(a) * r0)} ${f(O.y + Math.sin(a) * r0)}L${f(O.x + Math.cos(a) * r1)} ${f(O.y + Math.sin(a) * r1)}`,
        w: strong ? 1.1 : 0.55,
        o: strong ? 0.85 : 0.3 + rnd() * 0.35,
        white: i % 8 === 0,
      };
    });
    // and rings of light spreading from the same point
    const rings = [150, 265, 400, 560].map((r) => {
      const a0 = -Math.PI / 2 - 1.3, a1 = -Math.PI / 2 + 1.3;
      return `M${f(O.x + r * Math.cos(a0))} ${f(O.y + r * Math.sin(a0))}A${r} ${r} 0 0 1 ${f(O.x + r * Math.cos(a1))} ${f(O.y + r * Math.sin(a1))}`;
    });

    // black motes shed by the figure: each starts somewhere on its body and drifts outward and up
    const heart = { x: O.x, y: O.y - 215 };
    const motes = Array.from({ length: 280 }, () => {
      const a = rnd() * TAU, d = Math.sqrt(rnd());
      const x = heart.x + Math.cos(a) * d * 215, y = heart.y + Math.sin(a) * d * 150;
      const out = Math.atan2(y - heart.y - 40, x - heart.x) + (rnd() - 0.5) * 0.9;
      const far = 90 + rnd() * 380;
      // not a clean dot: a torn fragment, a splinter, or a little clump of broken blocks
      const r = 1 + Math.pow(rnd(), 2.2) * 5.2;
      const kind = rnd();
      let shape = "";
      if (kind < 0.55) {
        const n = 5 + Math.floor(rnd() * 4), tilt = rnd() * TAU, squash = 0.45 + rnd() * 0.55;
        for (let k = 0; k < n; k++) {
          const th = (k / n) * TAU + (rnd() - 0.5) * 0.7, rr = r * (0.35 + rnd() * 1.05);
          const px = Math.cos(th) * rr, py = Math.sin(th) * rr * squash;
          shape += `${k ? "L" : "M"}${f(x + px * Math.cos(tilt) - py * Math.sin(tilt))} ${f(y + px * Math.sin(tilt) + py * Math.cos(tilt))}`;
        }
        shape += "Z";
      } else if (kind < 0.8) {
        const th = rnd() * TAU, len = r * (1.6 + rnd() * 2.4), wd = r * (0.18 + rnd() * 0.3), kink = (rnd() - 0.5) * r;
        const ax = Math.cos(th), ay = Math.sin(th);
        shape = `M${f(x - ax * len)} ${f(y - ay * len)}L${f(x - ay * wd + ax * kink)} ${f(y + ax * wd + ay * kink)}L${f(x + ax * len)} ${f(y + ay * len)}L${f(x + ay * wd)} ${f(y - ax * wd)}Z`;
      } else {
        const cell = Math.max(0.9, r * 0.55);
        for (let k = 0; k < 2 + Math.floor(rnd() * 4); k++) {
          const gx = x + Math.round((rnd() - 0.5) * 4) * cell, gy = y + Math.round((rnd() - 0.5) * 4) * cell;
          const cw = cell * (rnd() < 0.3 ? 2 : 1), chh = cell * (rnd() < 0.2 ? 0.5 : 1);
          shape += `M${f(gx)} ${f(gy)}h${f(cw)}v${f(chh)}h${f(-cw)}Z`;
        }
      }
      return {
        shape,
        rot: (rnd() - 0.5) * 260,
        dx: Math.cos(out) * far,
        dy: Math.sin(out) * far - 50 - rnd() * 90,
        dur: 5 + rnd() * 8,
        delay: -rnd() * 13,
      };
    });

    // The planet's surface is one sheet of metal bent to follow the horizon: the sheet is drawn in
    // narrow vertical strips, each dropped by however far the limb has fallen away at that point.
    const STRIP = 5;
    const strips = Array.from({ length: Math.ceil((W + 80) / STRIP) }, (_, i) => {
      const x = -40 + i * STRIP;
      const mid = Math.min(Math.abs(x + STRIP / 2 - C.x), R - 1);
      return { x, dy: C.y - Math.sqrt(R * R - mid * mid) - (C.y - R) };
    });

    // meteors: each falls along a straight line from off the top of the sky to a point on the
    // ground a little below the horizon, well clear of the figure
    const meteors = [
      { x: 430, below: 40, from: { x: 140, y: -60 }, dur: 14, delay: -2 },
      { x: 1215, below: 65, from: { x: 1520, y: -60 }, dur: 17, delay: -9 },
      { x: 1400, below: 35, from: { x: 1600, y: -60 }, dur: 19, delay: -15 },
    ].map((m) => {
      const limb = C.y - Math.sqrt(R * R - (m.x - C.x) ** 2);
      const y = limb + m.below;
      return {
        x: m.x,
        y,
        // the way it is travelling, and the tilt of the ground where it lands
        angle: (Math.atan2(y - m.from.y, m.x - m.from.x) * 180) / Math.PI,
        tilt: (Math.asin((m.x - C.x) / R) * 180) / Math.PI,
        // the nearer the horizon, the flatter the ripples look
        flat: 0.16 + m.below / 520,
        dur: m.dur,
        delay: m.delay,
        sparks: Array.from({ length: 6 }, () => {
          const a = -Math.PI / 2 + (rnd() - 0.5) * 2.2, d = 16 + rnd() * 30;
          return { ex: Math.cos(a) * d, ey: Math.sin(a) * d };
        }),
      };
    });

    return { W, H, C, R, O, rays, rings, strips, STRIP, motes, meteors };
  }, []);

  const { W, H, C, R, O, rays, rings, strips, STRIP, motes, meteors } = scene;

  const [skin, setSkin] = useState<string | null>(null);
  useEffect(() => {
    let dead = false;
    metalTexture(800, 120, 10, "silver", 4).then((url) => {
      if (!dead && url) setSkin(url);
    });
    return () => {
      dead = true;
    };
  }, []);

  // a small chrome plate for the figure's tag, rendered by the same library as the other tags
  const [plate, setPlate] = useState<string | null>(null);
  useEffect(() => {
    let dead = false;
    metalTexture(190, 46, 7, "silver", 3).then((url) => {
      if (!dead && url) setPlate(url);
    });
    return () => {
      dead = true;
    };
  }, []);

  // the lines along which each wing meets the body, top to bottom, in the picture's pixels
  const WING_L_SEAM = "250,0 300,190 309,207 312,220 320,233 332,258 346,286 352,298 350,330 338,370 330,410 322,440 300,470 300,658";
  // the mechanical arm lies across the right wing; it belongs to the body and stays still
  const ARM_R =
    "483,405 492,399 520,392 560,381 578,371 588,360 578,352 588,345 580,330 590,317 602,309 620,300 640,302 651,308 650,330 640,340 630,350 612,365 602,380 590,390 572,405 560,416 540,429 520,436 500,443 489,439 482,425";
  const WING_R_SEAM = "560,0 534,140 533,215 520,270 495,295 478,305 470,330 472,400 485,445 520,470 520,658";
  // the figure: 848 x 658, cut off at the legs, so its base is sunk behind the horizon
  const FIG_W = 640, FIG_H = (FIG_W * 658) / 848;
  const figY = O.y + 40 - FIG_H;
  // where the head is inside the picture (about 415, 190 of 848 x 658)
  const headX = O.x - FIG_W / 2 + (415 / 848) * FIG_W, headY = figY + (190 / 658) * FIG_H;

  return (
    <svg id="horizon" className="poi-horizon" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        {/* atmosphere: densest at the surface, thinning out into space over about 110 units */}
        <radialGradient id="poi-air" gradientUnits="userSpaceOnUse" cx={C.x} cy={C.y} r={R + 110}>
          <stop offset={R / (R + 110) - 0.0005} stopColor="#5fb2ff" stopOpacity="0" />
          <stop offset={R / (R + 110)} stopColor="#bfe0ff" stopOpacity=".9" />
          <stop offset={(R + 10) / (R + 110)} stopColor="#6fb9ff" stopOpacity=".6" />
          <stop offset={(R + 34) / (R + 110)} stopColor="#4a9cf0" stopOpacity=".28" />
          <stop offset={(R + 70) / (R + 110)} stopColor="#3f8fe6" stopOpacity=".1" />
          <stop offset="1" stopColor="#3f8fe6" stopOpacity="0" />
        </radialGradient>
        {/* and the same air seen against the ground: a blue rim just inside the edge */}
        <radialGradient id="poi-air-in" gradientUnits="userSpaceOnUse" cx={C.x} cy={C.y} r={R}>
          <stop offset={(R - 60) / R} stopColor="#5fb2ff" stopOpacity="0" />
          <stop offset={(R - 18) / R} stopColor="#5fb2ff" stopOpacity=".3" />
          <stop offset="1" stopColor="#8fc8ff" stopOpacity=".8" />
        </radialGradient>
        <radialGradient id="poi-beam" gradientUnits="userSpaceOnUse" cx={O.x} cy={O.y} r="820">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".12" stopColor="#a9d4ff" />
          <stop offset=".5" stopColor="#5fb2ff" stopOpacity=".55" />
          <stop offset="1" stopColor="#5fb2ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="poi-beam-white" gradientUnits="userSpaceOnUse" cx={O.x} cy={O.y} r="820">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#eaf4ff" stopOpacity=".6" />
          <stop offset="1" stopColor="#eaf4ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="poi-source">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset=".25" stopColor="#a9d4ff" stopOpacity=".6" />
          <stop offset="1" stopColor="#5fb2ff" stopOpacity="0" />
        </radialGradient>
        {/* a meteor's tail: nothing at the far end, white hot at the head */}
        <linearGradient id="poi-tail">
          <stop offset="0" stopColor="#5fb2ff" stopOpacity="0" />
          <stop offset=".7" stopColor="#a9d4ff" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>
        <filter id="poi-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        {/* the planet's disc again, as seen from each meteor's landing point, to keep its ripples on the ground */}
        {meteors.map((m, i) => (
          <clipPath key={i} id={`poi-disc-at-${i}`}>
            <circle cx={C.x - m.x} cy={C.y - m.y} r={R} />
          </clipPath>
        ))}
        <clipPath id="poi-disc">
          <circle cx={C.x} cy={C.y} r={R} />
        </clipPath>
        {strips.map((st, i) => (
          <clipPath key={i} id={`poi-strip-${i}`}>
            <rect x={st.x} y={-2000} width={STRIP + 0.6} height={6000} />
          </clipPath>
        ))}
        {/* where the wings leave the body, in the figure's pixels (848 x 658) */}
        <clipPath id="poi-cut-wing-l" clipPathUnits="userSpaceOnUse">
          <polygon points={`0,0 ${WING_L_SEAM} 0,658`} />
        </clipPath>
        <clipPath id="poi-cut-wing-r" clipPathUnits="userSpaceOnUse">
          <path clipRule="evenodd" d={`M${`848,0 ${WING_R_SEAM} 848,658`.replace(/ /g, "L")}Z M${ARM_R.replace(/ /g, "L")}Z`} />
        </clipPath>
        <clipPath id="poi-cut-arm-r" clipPathUnits="userSpaceOnUse">
          <polygon points={ARM_R} />
        </clipPath>
        <clipPath id="poi-cut-body" clipPathUnits="userSpaceOnUse">
          <polygon points={`${WING_L_SEAM} 0,658 848,658 ${WING_R_SEAM.split(" ").reverse().join(" ")}`} />
        </clipPath>
      </defs>

      {/* the glow the beams come out of */}
      <ellipse className="poi-breathe" cx={O.x} cy={O.y} rx="520" ry="330" fill="url(#poi-source)" />

      {/* beams and rings of light, behind the figure */}
      <g className="poi-drift" style={{ transformOrigin: `${O.x}px ${O.y}px` }}>
      {rings.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="url(#poi-beam)" strokeWidth=".7" strokeDasharray={i % 2 ? "2 7" : undefined} opacity=".7" />
      ))}
      {rays.map((r, i) => (
        <path key={i} d={r.d} fill="none" stroke={r.white ? "url(#poi-beam-white)" : "url(#poi-beam)"} strokeWidth={r.w} strokeLinecap="round" opacity={r.o} />
      ))}

      </g>

      {/* the figure rises out of the planet, a halo behind its head */}
      <a
        className="poi-angel"
        href={ANGEL_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hypergaia (opens a post on X)"
      >
      <g className="poi-float">
          <circle cx={headX} cy={headY} r="92" fill="url(#poi-source)" opacity=".55" />
          <circle cx={headX} cy={headY} r="64" fill="none" stroke="#dcecff" strokeWidth="1.3" opacity=".9" />
          <circle cx={headX} cy={headY} r="73" fill="none" stroke="url(#poi-beam)" strokeWidth=".7" strokeDasharray="2 6" opacity=".8" />
          {/* the picture is drawn in pieces, cut into the body, its arm and each wing, so the wings can
              fold in and out from the shoulders; everything inside is in the picture's own pixels */}
          <g className="poi-figure" transform={`translate(${O.x - FIG_W / 2} ${figY}) scale(${FIG_W / 848})`}>
            <g className="poi-wing poi-wing-l">
              <image href="/manifold-figure.png" width="848" height="658" clipPath="url(#poi-cut-wing-l)" />
            </g>
            <g className="poi-wing poi-wing-r">
              <image href="/manifold-figure.png" width="848" height="658" clipPath="url(#poi-cut-wing-r)" />
            </g>
            <image href="/manifold-figure.png" width="848" height="658" clipPath="url(#poi-cut-body)" />
            <image href="/manifold-figure.png" width="848" height="658" clipPath="url(#poi-cut-arm-r)" />
          </g>
        </g>
        {/* what the pointer actually catches: the body and wings, not the picture's empty corners */}
        <ellipse cx={O.x} cy={O.y - 190} rx="250" ry="200" fill="transparent" />
      </a>

      {/* atmosphere: a soft blue halo and a hard bright limb */}
      <circle cx={C.x} cy={C.y} r={R + 110} fill="url(#poi-air)" />
      {/* the planet: nothing but the metal */}
      <circle cx={C.x} cy={C.y} r={R} fill="#9aa5b1" />
      <g clipPath="url(#poi-disc)">
        {skin &&
          strips.map((st, i) => (
            <image
              key={i}
              href={skin}
              x={-40}
              y={C.y - R - 3}
              width={W + 80}
              height={250}
              preserveAspectRatio="none"
              clipPath={`url(#poi-strip-${i})`}
              transform={`translate(0 ${st.dy.toFixed(2)})`}
            />
          ))}
      </g>

      <circle cx={C.x} cy={C.y} r={R} fill="url(#poi-air-in)" />
      <circle cx={C.x} cy={C.y} r={R} fill="none" stroke="#d6ecff" strokeWidth="1.2" opacity=".9" />
      {/* a thick bright seam along the horizon under the figure, so its cut-off base is covered */}
      <ellipse cx={O.x} cy={O.y - 2} rx="250" ry="13" fill="url(#poi-source)" />
      <ellipse cx={O.x} cy={O.y - 2} rx="120" ry="7" fill="#ffffff" opacity=".85" filter="url(#poi-blur)" />
      {/* meteors fall into the ground and each leaves a flash, a few sparks and ripples spreading over the metal */}
      <g style={{ pointerEvents: "none" }}>
        {meteors.map((m, i) => {
          const time = { animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` } as React.CSSProperties;
          return (
            <g key={i} className="poi-meteor" transform={`translate(${m.x} ${m.y.toFixed(1)})`}>
              <g clipPath={`url(#poi-disc-at-${i})`}>
                <g transform={`rotate(${m.tilt.toFixed(1)}) scale(1 ${m.flat.toFixed(2)})`}>
                  <circle className="poi-ripple" r="74" style={time} />
                  <circle className="poi-ripple poi-ripple-2" r="118" style={time} />
                </g>
              </g>
              <g transform={`rotate(${m.angle.toFixed(1)})`}>
                <g className="poi-meteor-body" style={time}>
                  <path d="M-170 0L0 -1.5L0 1.5Z" fill="url(#poi-tail)" />
                  <circle r="5" fill="#bfe0ff" opacity=".55" />
                  <circle r="2" fill="#fff" />
                </g>
              </g>
              <circle className="poi-impact" r="26" fill="url(#poi-source)" style={time} />
              {m.sparks.map((sp, k) => (
                <circle key={k} className="poi-spark" r="1.1" style={{ ...time, "--ex": `${sp.ex.toFixed(1)}px`, "--ey": `${sp.ey.toFixed(1)}px` } as React.CSSProperties} />
              ))}
            </g>
          );
        })}
      </g>
      {/* the black fragments drift in front of everything, the planet included */}
      <g style={{ pointerEvents: "none" }}>
      {motes.map((m, i) => (
        <path
          key={i}
          className="poi-mote"
          d={m.shape}
          style={{ "--dx": `${m.dx.toFixed(1)}px`, "--dy": `${m.dy.toFixed(1)}px`, "--rot": `${m.rot.toFixed(0)}deg`, animationDuration: `${m.dur.toFixed(2)}s`, animationDelay: `${m.delay.toFixed(2)}s` } as React.CSSProperties}
        />
      ))}
      </g>
      {/* the tag sits beside the figure and shows while it is hovered */}
      <g className="poi-angel-tag">
        <rect x={O.x + 89} y={O.y - 87} width="112" height="27" rx="6" fill="#000" opacity=".55" />
        <rect x={O.x + 90} y={O.y - 86} width="110" height="25" rx="5" fill="#aab4bf" />
        {plate && (
          <image href={plate} x={O.x + 90} y={O.y - 86} width="110" height="25" preserveAspectRatio="none" style={{ clipPath: "inset(0 round 5px)" }} />
        )}
        <rect x={O.x + 90} y={O.y - 86} width="110" height="25" rx="5" fill="none" stroke="#000" strokeWidth=".8" opacity=".6" />
        <text x={O.x + 145} y={O.y - 70.5} textAnchor="middle" className="poi-angel-name">
          HYPERGAIA <tspan className="poi-angel-arrow">↗</tspan>
        </text>
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Text rendering                                                      */
/* ------------------------------------------------------------------ */

const refByKey = new Map(manifoldRefs.map((r) => [r.key, r]));

// [[key]] / [[key|text]] citations, **bold**, *emphasis*, {{draft notes}}
const renderInline = (src: string, onCite?: (key: string) => void, keyPrefix = ""): ReactNode[] => {
  const out: ReactNode[] = [];
  const re = /\{\{([\s\S]*?)\}\}|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index));
    const k = `${keyPrefix}${i++}`;
    if (m[1] !== undefined) {
      if (SHOW_DRAFT_NOTES) {
        out.push(
          <span key={k} className="poi-note">
            [{renderInline(m[1], onCite, `${k}-`)}]
          </span>,
        );
      }
    } else if (m[2] !== undefined) {
      const m2 = m[2];
      if (m2.startsWith("#")) {
        // a link to another section of this page
        out.push(
          <a key={k} className="poi-cite" href={m2}>
            {m[3] ?? m2.slice(1)}
          </a>,
        );
        last = re.lastIndex;
        continue;
      }
      const ref = refByKey.get(m2);
      out.push(
        <a
          key={k}
          className="poi-cite"
          href={`#ref-${m[2]}`}
          onClick={(e) => {
            if (!onCite) return;
            e.preventDefault();
            onCite(m2);
          }}
        >
          {m[3] ?? ref?.label ?? m[2]}
        </a>,
      );
    } else if (m[4] !== undefined) {
      out.push(<strong key={k}>{m[4]}</strong>);
    } else {
      out.push(<em key={k}>{m[5]}</em>);
    }
    last = re.lastIndex;
  }
  if (last < src.length) out.push(src.slice(last));
  return out;
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Grenze+Gotisch:wght@400..800&family=Syncopate:wght@400;700&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..500&display=swap";

const PHONE = "(max-width: 760px)";

const Principles = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);
  // phones get the text only: no constellations, no planet scene, and a note saying so
  const [isPhone, setIsPhone] = useState(() => window.matchMedia(PHONE).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const onChange = () => setIsPhone(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const [reviewOn, setReviewOn] = useState(false);
  const [refsOpen, setRefsOpen] = useState(false);
  const [inspoOpen, setInspoOpen] = useState(false);
  const inspoRef = useRef<HTMLSpanElement>(null);
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // the site's pastel page background would flash at the edges on fast scrolls and overscroll,
    // so paint the whole document black while this page is open
    const html = document.documentElement, body = document.body;
    const prevBg = [html.style.background, body.style.background];
    html.style.background = body.style.background = "#020305";
    const prevTitle = document.title;
    document.title = `${manifoldTitle} · Principles of Intelligence`;
    let link = document.querySelector<HTMLLinkElement>("link[data-poi-fonts]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      link.setAttribute("data-poi-fonts", "");
      document.head.appendChild(link);
    }
    // deep links to a section (e.g. #agency-and-understanding) land on it once the page has rendered
    if (window.location.hash.length > 1) {
      document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
    }
    return () => {
      [html.style.background, body.style.background] = prevBg;
      document.title = prevTitle;
    };
  }, []);

  // reading progress: 0 at the top of the page, 1 when the end of the text reaches the bottom of the window
  useEffect(() => {
    const update = () => {
      const text = textRef.current;
      if (!text || !barRef.current) return;
      const end = text.offsetTop + text.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, end)));
      barRef.current.style.clipPath = `inset(0 ${(100 - p * 100).toFixed(2)}% 0 0)`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let ro: ResizeObserver | undefined;
    let dead = false;
    import("metallicss").then(({ metallicss }) => {
      if (dead) return;
      const timers = new Map<Element, number>();
      ro = new ResizeObserver((entries) => {
        for (const e of entries) {
          window.clearTimeout(timers.get(e.target));
          timers.set(e.target, window.setTimeout(() => metallicss(e.target as HTMLElement), 120));
        }
      });
      root.querySelectorAll<HTMLElement>(".poi-metal").forEach((el) => ro!.observe(el));
    });
    return () => {
      dead = true;
      ro?.disconnect();
    };
  }, []);

  // the inspiration menu closes on Escape or a click anywhere else
  useEffect(() => {
    if (!inspoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInspoOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!inspoRef.current?.contains(e.target as Node)) setInspoOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [inspoOpen]);

  useEffect(() => {
    if (!refsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRefsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [refsOpen]);

  // bring the cited entry into view inside the drawer
  useEffect(() => {
    if (!refsOpen || !activeRef) return;
    const el = drawerRef.current?.querySelector<HTMLElement>(`#ref-${activeRef}`);
    el?.scrollIntoView({ block: "center" });
  }, [refsOpen, activeRef]);

  const openRef = (key: string) => {
    setActiveRef(key);
    setRefsOpen(true);
  };

  let sectionNo = 0;
  const n = CONSTELLATIONS.length;

  return (
    <div className="poi-root" ref={rootRef}>
      <style>{CSS}</style>
      {/* bevel for the title: light the letters as if they were raised metal */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="poi-bevel" x="-4%" y="-6%" width="108%" height="116%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="bump" />
          <feDiffuseLighting in="bump" surfaceScale="3.5" diffuseConstant="1.25" lightingColor="#ffffff" result="shade">
            <feDistantLight azimuth="235" elevation="52" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="shade" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="lit" />
          <feSpecularLighting in="bump" surfaceScale="5" specularConstant="0.9" specularExponent="30" lightingColor="#f4f9ff" result="spec">
            <feDistantLight azimuth="235" elevation="58" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="specIn" in2="lit" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
        </filter>
      </svg>
      <div className="poi-haze" aria-hidden="true" />
      <Starfield />
      <MeteorCursor />

      {/* wide screens: constellations drift down both margins */}
      <div className="poi-margins" aria-label="Constellations">
        {CONSTELLATIONS.map((c, i) => {
          const left = i % 2 === 0;
          const jitter = (hash(c.id) - 0.5) * 60;
          return (
            <ConstellationLink
              key={c.id}
              c={c}
              className={left ? "poi-left" : "poi-right"}
              style={{
                top: `calc(${3 + (i * 88) / n}% + ${i < 2 ? 70 : 0}px)`,
                marginLeft: left ? jitter : undefined,
                marginRight: left ? undefined : jitter,
              }}
            />
          );
        })}
      </div>

      <div className="poi-progress" aria-hidden="true">
        <div ref={barRef} className="poi-progress-fill poi-metal" />
      </div>

      <Link to="/" className="poi-chip poi-metal poi-back">
        ← desktop
      </Link>

      <span className="poi-menu poi-inspo" ref={inspoRef}>
        <button
          type="button"
          className="poi-chip poi-metal"
          aria-expanded={inspoOpen}
          aria-controls="poi-inspo"
          onClick={() => setInspoOpen((o) => !o)}
        >
          Inspiration
        </button>
        <ul id="poi-inspo" className={`poi-menu-list poi-metal${inspoOpen ? " is-open" : ""}`}>
          {manifoldInspiration.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </span>

      <header className="poi-hero">
        {isPhone && <p className="poi-phone-note">This page is better viewed on a desktop.</p>}
        <p className="poi-kicker">Principles of Intelligence · research agenda</p>
        <h1>{manifoldTitle}</h1>
        <p className="poi-author">
          {manifoldAuthor}
          <a className="poi-chip poi-metal" href={manifoldPdf} target="_blank" rel="noopener noreferrer">
            PDF version
          </a>
          <button type="button" className="poi-chip poi-metal" aria-pressed={reviewOn} onClick={() => setReviewOn((o) => !o)}>
            Public peer review
          </button>
        </p>
      </header>

      {/* narrow screens (but not phones): constellations sit in the flow */}
      {!isPhone && (
        <div className="poi-sky">
          {CONSTELLATIONS.slice(0, 4).map((c) => (
            <ConstellationLink key={c.id} c={c} />
          ))}
        </div>
      )}

      <main className="poi-text" ref={textRef}>
        <section id="summary" className="poi-summary">
          <h3>Summary</h3>
          <p data-para="summary:0">{renderInline(manifoldSummary, openRef)}</p>
        </section>
        {manifoldSections.map((s) => {
          if (!s.sub) sectionNo++;
          return (
            <section key={s.id} id={s.id}>
              {s.sub ? (
                <h3>{s.title}</h3>
              ) : (
                <h2>
                  <span className="poi-num">{String(sectionNo).padStart(2, "0")}</span>
                  <span className="poi-h2-text">{s.title}</span>
                </h2>
              )}
              {s.paragraphs.map((p, i) => {
                const nodes = renderInline(p, openRef);
                return nodes.length ? (
                  <p key={i} data-para={`${s.id}:${i}`}>
                    {nodes}
                  </p>
                ) : null;
              })}
            </section>
          );
        })}
      </main>

      {!isPhone && (
        <div className="poi-sky">
          {CONSTELLATIONS.slice(4).map((c) => (
            <ConstellationLink key={c.id} c={c} />
          ))}
        </div>
      )}

      <footer className="poi-foot">
        <button type="button" className="poi-chip poi-metal" onClick={() => setRefsOpen(true)}>
          References
        </button>
        <Link to="/" className="poi-chip poi-metal">
          ← desktop
        </Link>
      </footer>

      {!isPhone && <HorizonScene />}

      <ManifoldPeerReview on={reviewOn} onExit={() => setReviewOn(false)} textRef={textRef} />

      {/* references: a steel drawer that slides in from the right */}
      <div className={`poi-scrim${refsOpen ? " is-open" : ""}`} onClick={() => setRefsOpen(false)} aria-hidden="true" />
      <aside
        id="poi-refs"
        ref={drawerRef}
        className={`poi-drawer${refsOpen ? " is-open" : ""}`}
        aria-label="References"
        aria-hidden={!refsOpen}
      >
        <div className="poi-drawer-head">
          <h2>References</h2>
          <button type="button" className="poi-chip poi-metal" onClick={() => setRefsOpen(false)} tabIndex={refsOpen ? 0 : -1}>
            close ✕
          </button>
        </div>
        <ol>
          {manifoldRefs.map((r) => (
            <li key={r.key} id={`ref-${r.key}`} className={r.key === activeRef ? "is-active" : undefined}>
              {renderInline(r.text)}
              {r.url && (
                <>
                  {" "}
                  <a href={r.url} target="_blank" rel="noopener noreferrer" tabIndex={refsOpen ? 0 : -1}>
                    {r.url.replace(/^https?:\/\//, "")}
                  </a>
                </>
              )}
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
};

const CSS = `
.poi-root {
  --void: #020305;
  --steel-hi: #f2f5f8;
  --ink: #b3bbc4;
  --ink-dim: #7b8590;
  --ink-faint: #4a525b;
  --plate: linear-gradient(180deg, #2b3138 0%, #171b20 48%, #0e1114 52%, #1d2228 100%);
  --chrome: linear-gradient(180deg, #fdfeff 0%, #c0c9d3 30%, #555e69 50%, #dfe6ee 62%, #7d8894 100%);
  --edge: #5a636d;
  --glow: #5fb2ff;
  --glow-rgb: 95, 178, 255;
  --col: 680px;
  position: relative;
  min-height: 100vh;
  background: var(--void);
  color: var(--ink);
  font-family: 'Newsreader', 'Iowan Old Style', Georgia, serif;
  overflow-x: clip;
  isolation: isolate;
}
.poi-root ::selection { background: rgba(var(--glow-rgb), .3); color: #fff; }

.poi-canvas { position: fixed; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; }
.poi-meteor { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 20; pointer-events: none; }
.poi-haze {
  position: fixed; inset: -20%; z-index: -2; pointer-events: none;
  background:
    radial-gradient(60% 22% at 50% 50%, rgba(190,205,222,.075), transparent 70%),
    radial-gradient(30% 12% at 38% 54%, rgba(var(--glow-rgb), .05), transparent 70%),
    radial-gradient(34% 10% at 64% 46%, rgba(190,205,222,.05), transparent 70%);
  transform: rotate(-24deg);
}

/* ---------- reading progress ---------- */
.poi-progress {
  position: fixed; top: 0; left: 0; right: 0; height: 11px; z-index: 6;
  background: linear-gradient(180deg, #05070a, #14181d); border-bottom: 1px solid rgba(120,131,143,.45);
  box-shadow: 0 2px 10px rgba(0,0,0,.7);
}
.poi-progress-fill {
  position: relative; height: 100%; clip-path: inset(0 100% 0 0);
  background: linear-gradient(180deg, #f4f7fa, #aeb8c3 45%, #5d6772 55%, #cfd7df); /* shown until the metal renders */
  --metal: silver; --convexity: 4;
}
/* ---------- metal surfaces (rendered by MetalliCSS into a canvas behind the content) ---------- */
.poi-metal { isolation: isolate; overflow: hidden; }
.poi-metal > canvas.metal { pointer-events: none; }

/* ---------- steel chips (buttons) ---------- */
.poi-chip {
  appearance: none; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; position: relative;
  font: 700 10px/1 'Syncopate', sans-serif; letter-spacing: .24em; text-transform: uppercase;
  color: #0a0d11; text-shadow: 0 1px 0 rgba(255,255,255,.55); text-decoration: none; padding: 12px 16px 11px;
  background: #aab4bf; border: 0; border-radius: 7px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.6), 0 3px 12px rgba(0,0,0,.7);
  --metal: silver; --convexity: 3;
  transition: box-shadow .25s, filter .25s;
}
.poi-chip:hover, .poi-chip:focus-visible {
  outline: none; filter: brightness(1.14);
  box-shadow: 0 0 0 2px #000, 0 0 0 3px rgba(255,255,255,.35), 0 3px 12px rgba(0,0,0,.7);
}
.poi-chip span { color: #0a0d11; }
.poi-back.poi-chip { position: absolute; top: 26px; left: 20px; z-index: 3; }

/* ---------- hero ---------- */
.poi-hero {
  min-height: 94vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 110px 20px 40px; max-width: 980px; margin: 0 auto;
}
.poi-phone-note {
  margin: 0 0 30px; padding: 9px 14px; border: 1px solid rgba(90,99,109,.5); border-radius: 7px;
  font: 400 9px/1.6 'Syncopate', sans-serif; letter-spacing: .2em; text-transform: uppercase; color: var(--ink);
  background: rgba(20,24,29,.7);
}
.poi-kicker {
  font: 400 10px/1.6 'Syncopate', sans-serif; letter-spacing: .42em; text-transform: uppercase;
  color: var(--ink-dim); margin: 0 0 30px;
}
.poi-hero h1 {
  font: 600 clamp(46px, 9.4vw, 118px)/.94 'Grenze Gotisch', 'UnifrakturMaguntia', serif;
  letter-spacing: .01em; margin: 0; text-wrap: balance; padding: .08em .1em;
  /* each line of the title gets its own reflection, the way chrome lettering is drawn */
  background: linear-gradient(180deg,
      #8e99a5 0%, #f7fafc 16%, #dfe6ec 34%, #aab4bf 47%,
      #3a424b 51%, #59626c 56%, #aeb8c2 70%, #e6ecf1 84%, #7a8591 100%)
    content-box 0 0 / 100% .94em repeat-y;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  -webkit-text-stroke: 1px rgba(235,242,250,.28);
  /* a solid cast shadow down and to the right, in dark blue steel so it shows against the black */
  filter: url(#poi-bevel) drop-shadow(.045em .055em 0 #1c2a3a) drop-shadow(0 0 26px rgba(var(--glow-rgb), .28));
}
.poi-author { margin: 30px 0 0; font-size: 19px; font-style: italic; color: var(--ink); display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 14px 22px; }
.poi-author .poi-chip { font-style: normal; }
.poi-menu { position: relative; display: inline-flex; }
.poi-inspo { position: absolute; top: 26px; right: 20px; z-index: 5; }
/* the dropdown is one chrome plate, the names engraved on it */
.poi-menu-list {
  position: absolute; top: calc(100% + 10px); right: 0; z-index: 5; min-width: 250px;
  list-style: none; margin: 0; padding: 6px 0; text-align: left;
  background: #aab4bf; border-radius: 7px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.6), 0 14px 34px rgba(0,0,0,.8);
  --metal: silver; --convexity: 3;
  opacity: 0; visibility: hidden; transform: translateY(-6px);
  transition: opacity .25s ease, transform .25s ease, visibility 0s .25s;
}
.poi-menu-list.is-open { opacity: 1; visibility: visible; transform: none; transition: opacity .25s ease, transform .25s ease; }
.poi-menu-list li {
  padding: 10px 18px 9px; white-space: nowrap;
  font: 700 9.5px/1.3 'Syncopate', sans-serif; letter-spacing: .2em; text-transform: uppercase;
  color: #0a0d11; text-shadow: 0 1px 0 rgba(255,255,255,.55);
}
.poi-menu-list li + li { border-top: 1px solid rgba(0,0,0,.28); box-shadow: inset 0 1px 0 rgba(255,255,255,.35); }
.poi-author span { color: var(--ink-dim); }

/* ---------- text ---------- */
.poi-text { max-width: var(--col); margin: 0 auto; padding: 0 22px 70px; position: relative; z-index: 1; }
.poi-text section { margin-top: 84px; scroll-margin-top: 40px; }
.poi-text section + section:has(h3) { margin-top: 44px; }
.poi-text h2 {
  font: 700 clamp(15px, 2.2vw, 19px)/1.5 'Syncopate', sans-serif; letter-spacing: .14em; text-transform: uppercase;
  margin: 0 0 26px; padding-bottom: 16px; text-wrap: balance;
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, #cfd7df, #5a636d 40%, transparent) 1;
}
.poi-h2-text { background: var(--chrome); -webkit-background-clip: text; background-clip: text; color: transparent; }
.poi-num {
  display: block; font-weight: 400; font-size: 10px; letter-spacing: .4em; color: var(--glow); margin-bottom: 12px;
}
.poi-text h3 {
  font: 400 12px/1.6 'Syncopate', sans-serif; letter-spacing: .22em; text-transform: uppercase;
  color: #d5dbe2; margin: 0 0 18px; padding-left: 14px; border-left: 2px solid var(--glow);
}
.poi-text p { font-size: 19.5px; line-height: 1.72; margin: 0 0 1.25em; font-weight: 350; hyphens: auto; }
.poi-text em { color: var(--steel-hi); }
.poi-text strong { font-weight: 650; color: var(--steel-hi); }
.poi-text .poi-summary { margin-top: 0; }
.poi-text .poi-summary p { font-size: 21.5px; line-height: 1.62; color: #d5dbe2; hyphens: manual; }
.poi-cite {
  color: var(--ink-dim); text-decoration: none; border-bottom: 1px dotted var(--ink-faint); cursor: pointer;
  transition: color .25s, border-color .25s;
}
.poi-cite:hover, .poi-cite:focus-visible { color: var(--glow); border-color: var(--glow); }
.poi-note { color: var(--ink-faint); font-style: italic; }
.poi-note .poi-cite { color: var(--ink-faint); }

.poi-foot { display: flex; justify-content: center; flex-wrap: wrap; gap: 14px; padding: 30px 20px 30px; }

.poi-horizon { display: block; overflow: visible; width: 100%; height: clamp(250px, 36vw, 600px); margin-top: clamp(330px, 36vw, 560px); }

/* the figure: toned towards steel so the blue comes from its light, with a thin black aura */
.poi-figure {
  filter: saturate(.32) contrast(1.18) brightness(1.06)
    drop-shadow(0 0 1.2px #000) drop-shadow(0 0 2.5px #000) drop-shadow(0 0 4px rgba(0,0,0,.85));
}
.poi-figure { pointer-events: none; transition: filter .5s ease; }
/* the wings fold in towards the body and open out again, hinged where they meet it */
.poi-wing { animation: poi-flap 4.6s cubic-bezier(.45, 0, .3, 1) infinite; will-change: transform; }
.poi-wing-l { transform-origin: 352px 300px; --fold: -4deg; }
.poi-wing-r { transform-origin: 470px 305px; --fold: 4deg; }
@keyframes poi-flap {
  0%, 100% { transform: scaleX(1) rotate(0deg); }
  42% { transform: scaleX(.72) rotate(var(--fold)); }
}
.poi-angel { cursor: pointer; outline: none; }
.poi-angel-tag { opacity: 0; transition: opacity .35s ease, transform .35s ease; transform: translateX(-5px); pointer-events: none; }
.poi-angel:hover ~ .poi-angel-tag, .poi-angel:focus-visible ~ .poi-angel-tag { opacity: 1; transform: none; }
.poi-angel:hover .poi-figure, .poi-angel:focus-visible .poi-figure {
  filter: saturate(.32) contrast(1.18) brightness(1.22)
    drop-shadow(0 0 1.2px #000) drop-shadow(0 0 2.5px #000) drop-shadow(0 0 4px rgba(0,0,0,.85));
}
.poi-angel-name { font: 700 7.5px 'Syncopate', sans-serif; letter-spacing: .22em; fill: #0a0d11; }
.poi-angel-arrow { font: 400 9px 'Newsreader', Georgia, serif; letter-spacing: 0; }
@media (hover: none) { .poi-angel-tag { opacity: .9; transform: none; } }
.poi-float { animation: poi-float 9s ease-in-out infinite; }
.poi-breathe { opacity: .5; animation: poi-breathe 7s ease-in-out infinite; }
.poi-drift { animation: poi-drift 46s ease-in-out infinite; }
@keyframes poi-float { 50% { transform: translateY(-5px); } }
@keyframes poi-breathe { 50% { opacity: .85; } }
@keyframes poi-drift { 0%, 100% { transform: rotate(-2.2deg); } 50% { transform: rotate(2.2deg); } }
.poi-mote {
  fill: #000; stroke: rgba(150,200,255,.4); stroke-width: .5; stroke-linejoin: miter; opacity: 0;
  transform-box: fill-box; transform-origin: center;
  animation: poi-mote 8s linear infinite;
}
@keyframes poi-mote {
  0% { opacity: 0; transform: translate(0, 0) rotate(0deg); }
  10% { opacity: 1; }
  75% { opacity: .9; }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); }
}

/* meteors: the fall takes the first 8% of each cycle, the disturbance it leaves the next quarter */
.poi-meteor-body { opacity: 0; animation: poi-fall 14s linear infinite; }
.poi-impact { opacity: 0; animation: poi-impact 14s linear infinite; }
.poi-spark { fill: #eaf4ff; opacity: 0; animation: poi-spark 14s linear infinite; }
.poi-ripple {
  fill: none; stroke: #f4faff; stroke-width: 1.6; vector-effect: non-scaling-stroke; opacity: 0;
  filter: drop-shadow(0 1.5px 0 rgba(10,13,17,.55));
  animation: poi-ripple 14s linear infinite;
}
.poi-ripple-2 { stroke-width: 1; animation-name: poi-ripple-2; }
@keyframes poi-fall {
  0% { transform: translateX(-780px); opacity: 0; }
  1% { opacity: 1; }
  8% { transform: translateX(0); opacity: 1; }
  8.5%, 100% { transform: translateX(0); opacity: 0; }
}
@keyframes poi-impact {
  0%, 7.8% { transform: scale(.2); opacity: 0; }
  8.3% { transform: scale(1); opacity: 1; animation-timing-function: ease-out; }
  14%, 100% { transform: scale(2.1); opacity: 0; }
}
@keyframes poi-spark {
  0%, 8% { transform: translate(0, 0); opacity: 0; }
  8.3% { opacity: 1; animation-timing-function: cubic-bezier(.1, .7, .3, 1); }
  15%, 100% { transform: translate(var(--ex), var(--ey)); opacity: 0; }
}
@keyframes poi-ripple {
  0%, 8% { transform: scale(.04); opacity: 0; }
  8.6% { opacity: .95; animation-timing-function: cubic-bezier(.15, .6, .3, 1); }
  30%, 100% { transform: scale(1); opacity: 0; }
}
@keyframes poi-ripple-2 {
  0%, 10% { transform: scale(.04); opacity: 0; }
  10.6% { opacity: .7; animation-timing-function: cubic-bezier(.15, .6, .3, 1); }
  38%, 100% { transform: scale(1); opacity: 0; }
}

/* ---------- references drawer ---------- */
.poi-scrim {
  position: fixed; inset: 0; z-index: 7; background: rgba(0,0,0,.5);
  opacity: 0; pointer-events: none; transition: opacity .35s;
}
.poi-scrim.is-open { opacity: 1; pointer-events: auto; }
.poi-drawer {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 8; width: min(460px, 100vw);
  overflow-y: auto; overscroll-behavior: contain; padding: 0 26px 60px;
  background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.012) 0 1px, transparent 1px 3px),
    linear-gradient(180deg, #1b2026, #0c0f12);
  border-left: 1px solid var(--edge);
  box-shadow: inset 1px 0 0 rgba(255,255,255,.14), -30px 0 60px rgba(0,0,0,.7);
  transform: translateX(104%); visibility: hidden;
  transition: transform .45s cubic-bezier(.2,.8,.2,1), visibility 0s .45s;
}
.poi-drawer.is-open { transform: none; visibility: visible; transition: transform .45s cubic-bezier(.2,.8,.2,1); }
.poi-drawer-head {
  position: sticky; top: 0; z-index: 1; display: flex; align-items: center; justify-content: space-between;
  margin: 0 -26px 22px; padding: 18px 20px 16px 26px;
  background: linear-gradient(180deg, #1b2026 70%, rgba(27,32,38,.0));
}
.poi-drawer-head h2 {
  font: 700 14px/1 'Syncopate', sans-serif; letter-spacing: .2em; text-transform: uppercase; margin: 0;
  background: var(--chrome); -webkit-background-clip: text; background-clip: text; color: transparent;
}
.poi-drawer ol { list-style: none; margin: 0; padding: 0; }
.poi-drawer li {
  font-size: 15px; line-height: 1.58; color: var(--ink-dim); margin: 0 0 14px; padding: 2px 0 2px 14px;
  border-left: 1px solid transparent; overflow-wrap: anywhere; transition: color .4s, border-color .4s;
}
.poi-drawer li.is-active { color: var(--steel-hi); border-left-color: var(--glow); text-shadow: 0 0 16px rgba(var(--glow-rgb), .45); }
.poi-drawer li em { color: inherit; }
.poi-drawer li a { color: inherit; text-decoration: underline; text-decoration-color: var(--ink-faint); text-underline-offset: 3px; }
.poi-drawer li a:hover { color: var(--glow); }

/* ---------- constellations ---------- */
.poi-const {
  display: block; position: relative; text-decoration: none; color: var(--glow);
  -webkit-tap-highlight-color: transparent; outline: none;
}
.poi-const svg { display: block; width: 100%; height: auto; overflow: visible; transition: filter .6s ease; }
.poi-lines line {
  stroke: #9aa5b1; stroke-width: 1; vector-effect: non-scaling-stroke; stroke-linecap: round;
  opacity: .38; transition: opacity .6s ease, stroke .6s ease;
}
.poi-star { opacity: var(--o, .5); transition: opacity .5s ease; animation: poi-twinkle 5s ease-in-out infinite; }
.poi-star circle {
  fill: #e3e9f0; transform-box: fill-box; transform-origin: center;
  transition: transform .5s ease, fill .5s ease;
}
.poi-star.is-blue circle { fill: #8fc2ff; }
.poi-flare { stroke: #e3e9f0; stroke-width: .5; vector-effect: non-scaling-stroke; opacity: .35; fill: none; }
.poi-star.is-blue .poi-flare { stroke: #8fc2ff; }
@keyframes poi-twinkle { 50% { opacity: calc(var(--o, .5) * .6); } }
.poi-const:hover svg, .poi-const:focus-visible svg {
  filter: drop-shadow(0 0 5px rgba(var(--glow-rgb), .95)) drop-shadow(0 0 20px rgba(var(--glow-rgb), .55));
}
.poi-const:hover .poi-lines line, .poi-const:focus-visible .poi-lines line { opacity: .95; stroke: var(--glow); }
.poi-const:hover .poi-star, .poi-const:focus-visible .poi-star { opacity: 1; animation: none; }
.poi-const:hover .poi-star circle, .poi-const:focus-visible .poi-star circle { fill: #eaf4ff; transform: scale(1.5); }

.poi-tag {
  position: absolute; left: 50%; top: 100%; transform: translate(-50%, 2px);
  display: flex; flex-direction: column; align-items: center; gap: 5px; white-space: nowrap;
  padding: 9px 14px 8px; border-radius: 7px; background: #aab4bf;
  box-shadow: 0 0 0 1px rgba(0,0,0,.6), 0 3px 12px rgba(0,0,0,.7);
  --metal: silver; --convexity: 3;
  opacity: 0; pointer-events: none; transition: opacity .35s ease, transform .35s ease;
}
.poi-tag-name {
  font: 700 9px/1 'Syncopate', sans-serif; letter-spacing: .24em; text-transform: uppercase;
  color: #0a0d11; text-shadow: 0 1px 0 rgba(255,255,255,.55);
}
.poi-tag-gloss { font: italic 500 13px/1 'Newsreader', Georgia, serif; color: #0a0d11; text-shadow: 0 1px 0 rgba(255,255,255,.4); }
.poi-const:hover .poi-tag, .poi-const:focus-visible .poi-tag { opacity: 1; transform: translate(-50%, 8px); }

/* wide: in the margins */
.poi-margins { display: none; }
.poi-sky {
  display: grid; grid-template-columns: repeat(2, minmax(0, 145px)); justify-content: center;
  gap: 64px 36px; padding: 10px 24px 70px;
}
@media (min-width: 1240px) {
  .poi-margins { display: block; position: absolute; inset: 0; pointer-events: none; z-index: 2; }
  .poi-margins .poi-const {
    position: absolute; pointer-events: auto;
    width: min(185px, calc((100% - var(--col)) / 2 - 70px));
  }
  .poi-margins .poi-left { left: calc((100% - var(--col)) / 4); transform: translateX(-50%); }
  .poi-margins .poi-right { right: calc((100% - var(--col)) / 4); transform: translateX(50%); }
  .poi-sky { display: none; }
}
/* touch: nothing to hover, so keep the names softly visible */
@media (hover: none) {
  .poi-tag { opacity: .85; transform: translate(-50%, 8px); }
  .poi-lines line { opacity: .45; }
}
@media (max-width: 560px) {
  .poi-text p { font-size: 18px; line-height: 1.66; hyphens: manual; }
  .poi-hero { min-height: 80vh; }
  .poi-foot { padding-bottom: 90px; }
  .poi-sky { gap: 70px 24px; }
  .poi-chip { letter-spacing: .18em; padding: 11px 12px 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .poi-root *, .poi-drawer { transition-duration: .01ms !important; }
  .poi-star { animation: none; }
  .poi-float, .poi-breathe, .poi-drift, .poi-wing { animation: none; }
  .poi-meteor { display: none; }
  .poi-mote { animation: none; opacity: .85; transform: translate(calc(var(--dx) * .5), calc(var(--dy) * .5)); }
}
`;

export default Principles;
