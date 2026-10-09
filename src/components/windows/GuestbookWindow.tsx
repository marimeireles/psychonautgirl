import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

const ENTRIES_PER_SIDE = 5;
const FLIP_MS = 750;

const PARCHMENT = "#e9d3a2";
const PARCHMENT_DARK = "#c8a86a";
const INK = "#241206"; // same dark ink on both pages
const INK_FADED = "#6b4a2b";
const GOLD = "#c9a04a";
const GOLD_DIM = "#8a6a2a";
const LEATHER = "#3a1a08";

const parchmentBg = `
  radial-gradient(ellipse at 20% 15%, rgba(255,240,200,0.4) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 85%, rgba(120,80,40,0.25) 0%, transparent 55%),
  radial-gradient(circle at 50% 50%, ${PARCHMENT} 0%, ${PARCHMENT_DARK} 130%)
`;

const scriptBody = "'Nothing You Could Do', 'Homemade Apple', cursive";

// Each visitor writes in their own hand, picked from faces that read as real handwriting
const HANDS: { font: string; size: number; lift: number }[] = [
  { font: "'Homemade Apple', cursive", size: 0.9, lift: 1.95 },
  { font: "'La Belle Aurore', cursive", size: 1.05, lift: 1.75 },
  { font: "'Cedarville Cursive', cursive", size: 1.0, lift: 1.85 },
  { font: "'Nothing You Could Do', cursive", size: 1.0, lift: 1.7 },
  { font: "'Dawning of a New Day', cursive", size: 1.14, lift: 1.6 },
];
const PEN_INK = "#241206"; // every entry in the same dark ink
const hash = (n: number, salt: number) => {
  let h = (n * 2654435761 + salt * 40503) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13;
  return (h % 1000) / 1000;
};
const handFor = (id: number) => {
  const hand = HANDS[Math.floor(hash(id, 1) * HANDS.length)];
  return {
    ...hand,
    tilt: (hash(id, 3) - 0.5) * 3,            // -1.5 .. 1.5 deg
    indent: Math.floor(hash(id, 4) * 22),     // px, where the pen started
    gap: 10 + Math.floor(hash(id, 5) * 22),   // px of space left before the next entry
    msgShift: Math.floor(hash(id, 7) * 14),   // the message doesn't line up with the name
    flourish: Math.floor(hash(id, 6) * 3),    // which underline squiggle
  };
};

// Weathering, as on the reading list: each glyph a touch bigger or smaller, leaned, lifted,
// and now and then a thin band missing where the nib skipped. Deterministic per entry.
const weather = (text: string, seed: number) => {
  let k = 0;
  return text.split(" ").map((word, wi) => {
    if (!word) return null;
    const glyphs = Array.from(word).map((ch, ci) => {
      k += 1;
      const r = (salt: number) => hash(seed * 131 + k, salt);
      const size = (0.93 + r(1) * 0.14).toFixed(2);
      const rot = ((r(2) - 0.5) * 5).toFixed(1);
      const dy = ((r(3) - 0.5) * 2).toFixed(1);
      const style: React.CSSProperties = {
        display: "inline-block",
        fontSize: `${size}em`,
        transform: `rotate(${rot}deg) translateY(${dy}px)`,
      };
      if (r(4) < 0.1) {
        const angle = Math.floor(r(5) * 180);
        const at = Math.floor(r(6) * 80);
        const gap = 4 + Math.floor(r(7) * 8);
        style.color = "transparent";
        style.WebkitBackgroundClip = "text";
        style.backgroundClip = "text";
        style.backgroundImage = `linear-gradient(${angle}deg, ${PEN_INK} ${at}%, transparent ${at}%, transparent ${at + gap}%, ${PEN_INK} ${at + gap}%)`;
      }
      return <span key={ci} style={style}>{ch}</span>;
    });
    return (
      <span key={wi} style={{ whiteSpace: "nowrap" }}>
        {glyphs}{" "}
      </span>
    );
  });
};

// hand-drawn underline under a signature
const FLOURISHES = [
  "M2 6 C 20 2, 40 10, 60 5 S 100 2, 118 7",
  "M2 7 C 30 1, 50 11, 80 4 S 110 9, 118 5 M6 10 C 40 7, 70 12, 112 9",
  "M2 5 C 25 9, 45 1, 70 6 S 105 3, 118 8",
];
const scriptDisplay = "'Homemade Apple', 'Nothing You Could Do', cursive";

type SideContent =
  | { type: "form" }
  | { type: "entries"; entries: GuestbookEntry[] }
  | { type: "blank" }
  | { type: "cover" };

// Scratched into the inside of the back cover: a name, a circle, and a cat,
// in the same wobbly hand as the reading list's doodles.
const ENGRAVING_PATHS = [
  // a circle, drawn in one go and not quite closed
  "M 196 112 C 195 101 204 95 212 96 C 221 97 226 105 225 113 C 224 121 216 127 208 126 C 200 125 195 119 196 113 C 196 110 198 108 200 108",
  // cat head, gone over twice where the hand hesitated
  "M 160 196 C 159 158 188 141 212 142 C 241 143 262 164 260 198 C 258 232 236 250 210 249 C 182 248 161 230 160 196 Z",
  "M 163 190 C 165 165 186 147 210 146",
  // ears
  "M 173 165 L 166 124 L 198 148",
  "M 249 166 L 257 124 L 227 148",
  "M 170 160 L 168 130",
  // eyes
  "M 191 190 Q 196 184 202 190",
  "M 220 190 Q 225 184 231 190",
  // nose and mouth
  "M 206 206 L 216 206 L 211 212 Z",
  "M 211 212 Q 207 221 199 217",
  "M 211 212 Q 215 221 223 217",
  // whiskers
  "M 150 201 L 190 204",
  "M 148 213 L 190 209",
  "M 272 201 L 232 204",
  "M 274 213 L 232 209",
  // stray scratches, where the point slipped
  "M 140 240 L 152 236",
  "M 282 170 L 288 178",
  "M 236 262 L 246 258",
];

const Engraving = () => (
  <svg viewBox="0 0 420 300" className="engraving" style={{ width: "min(80%, 380px)" }} aria-label="mari was here">
    <defs>
      {/* roughen every line so it looks scratched, not drawn */}
      <filter id="scratchy" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="5.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="scorch" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.6" />
      </filter>
      {/* the line the name was scratched along: not level, not straight */}
      <path id="engravingBaseline" d="M 40 104 Q 110 88 190 70 T 390 14" fill="none" />
    </defs>
    <g filter="url(#scratchy)">
      {(["halo", "cut", "core"] as const).map((layer) => (
        <g key={layer} className={layer}>
          <text rotate="-6 4 -3 7 -5 0 5 -8 3 -4 6 -2 4">
            <textPath href="#engravingBaseline" startOffset="50%" textAnchor="middle">mari was here</textPath>
          </text>
          {ENGRAVING_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      ))}
    </g>
  </svg>
);

interface GuestbookWindowProps {
  onClose?: () => void;
  onCoverChange?: (onCover: boolean) => void;
}

export const GuestbookWindow = ({ onClose, onCoverChange }: GuestbookWindowProps) => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<"next" | "prev">("next");
  // Only one face of the turning page exists at a time; it swaps at the midpoint of the turn.
  const [pastMidpoint, setPastMidpoint] = useState(false);
  const flipTargetRef = useRef(0);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("guestbook")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching guestbook entries:", error);
      toast.error("Failed to load guestbook entries");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    try {
      const { data, error } = await supabase
        .from("guestbook")
        .insert([{ name: name.trim(), message: message.trim() }])
        .select()
        .single();
      if (error) throw error;
      setEntries([data, ...entries]);
      setName("");
      setMessage("");
      setPage(0);
      toast.success("Thanks for signing the guestbook!");
    } catch (error) {
      console.error("Error adding guestbook entry:", error);
      toast.error("Failed to add entry. Please try again.");
    }
  };

  const entryPages =
    entries.length <= ENTRIES_PER_SIDE
      ? 1
      : 1 + Math.ceil((entries.length - ENTRIES_PER_SIDE) / (2 * ENTRIES_PER_SIDE));
  // one more spread past the entries: the inside of the back cover
  const totalPages = entryPages + 1;
  const onCover = page === totalPages - 1;

  useEffect(() => {
    onCoverChange?.(onCover && !flipping);
  }, [onCover, flipping, onCoverChange]);

  const getPageContent = (p: number): { left: SideContent; right: SideContent } => {
    if (p >= entryPages) {
      return { left: { type: "blank" }, right: { type: "cover" } };
    }
    if (p === 0) {
      return {
        left: { type: "form" },
        right: { type: "entries", entries: entries.slice(0, ENTRIES_PER_SIDE) },
      };
    }
    const leftStart = ENTRIES_PER_SIDE + (p - 1) * ENTRIES_PER_SIDE * 2;
    return {
      left: {
        type: "entries",
        entries: entries.slice(leftStart, leftStart + ENTRIES_PER_SIDE),
      },
      right: {
        type: "entries",
        entries: entries.slice(leftStart + ENTRIES_PER_SIDE, leftStart + ENTRIES_PER_SIDE * 2),
      },
    };
  };

  const startFlip = (dir: "next" | "prev") => {
    if (flipping) return;
    if (dir === "next" && page >= totalPages - 1) return;
    if (dir === "prev" && page <= 0) return;
    flipTargetRef.current = dir === "next" ? page + 1 : page - 1;
    setFlipDir(dir);
    setPastMidpoint(false);
    setFlipping(true);
    window.setTimeout(() => setPastMidpoint(true), FLIP_MS / 2);
    window.setTimeout(() => {
      setPage(flipTargetRef.current);
      setFlipping(false);
      setPastMidpoint(false);
    }, FLIP_MS);
  };

  const renderEntry = (entry: GuestbookEntry) => {
    const h = handFor(entry.id);
    const date = new Date(entry.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
    return (
      <div
        key={entry.id}
        className="relative"
        style={{
          transform: `rotate(${h.tilt}deg)`,
          paddingLeft: h.indent,
          marginBottom: h.gap,
          fontFamily: h.font,
          color: PEN_INK,
          fontSize: "1.22em",
        }}
      >
        <div className="flex items-end gap-3 flex-wrap">
          <span className="relative inline-block" style={{ fontSize: `${1.25 * h.size}em`, lineHeight: 1.1 }}>
            {weather(entry.name, entry.id)}
            <svg
              viewBox="0 0 120 12"
              preserveAspectRatio="none"
              className="absolute left-0 right-0"
              style={{ bottom: -6, height: 10, width: "100%", opacity: 0.75 }}
            >
              <path d={FLOURISHES[h.flourish]} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </span>
          <span style={{ fontSize: "0.62em", opacity: 0.7 }}>
            {date}
          </span>
        </div>
        <p style={{ fontSize: `${h.size}em`, lineHeight: h.lift, marginTop: 8, marginLeft: h.msgShift, marginRight: 6 }}>
          {weather(entry.message, entry.id + 1)}
        </p>
      </div>
    );
  };

  // Entries are rendered once per fetch, not on every flip or keystroke
  const renderedEntries = useMemo(
    () => Object.fromEntries(entries.map((e) => [e.id, renderEntry(e)])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries]
  );

  const renderEntries = (list: GuestbookEntry[]) => {
    if (loading) {
      return (
        <div className="text-center py-4" style={{ color: INK_FADED, fontFamily: scriptDisplay }}>
          Loading...
        </div>
      );
    }
    if (entries.length === 0) {
      return (
        <div className="text-center py-4" style={{ color: INK_FADED, fontFamily: scriptDisplay }}>
          No entries yet. Be the first to sign!
        </div>
      );
    }
    if (list.length === 0) {
      return <div className="flex-1" />;
    }
    return <div className="overflow-hidden" style={{ overflowWrap: "anywhere" }}>{list.map((e) => renderedEntries[e.id])}</div>;
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 flex-shrink-0">
      <div>
        <label
          className="block mb-1"
          style={{ color: INK, fontFamily: scriptDisplay, fontSize: "1.05em" }}
        >
          ❧ Thy Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent px-1 py-1 outline-none"
          style={{
            color: INK,
            fontFamily: "'Nothing You Could Do', cursive",
            fontSize: "1.15em",
          }}
          required
        />
      </div>
      <div>
        <label
          className="block mb-1"
          style={{ color: INK, fontFamily: scriptDisplay, fontSize: "1.05em" }}
        >
          ❧ Thy Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-transparent px-1 py-1 resize-none outline-none"
          style={{
            color: INK,
            fontFamily: "'Nothing You Could Do', cursive",
            fontSize: "1.15em",
            lineHeight: 1.6,
            backgroundImage: `repeating-linear-gradient(180deg, transparent 0 calc(1.6em - 1px), ${INK_FADED}55 calc(1.6em - 1px) 1.6em)`,
          }}
          rows={3}
          required
        />
      </div>
      {/* an ink-drawn oval, as if someone circled the words by hand */}
      <button
        type="submit"
        className="relative px-5 py-1.5 transition-all cursor-pointer"
        style={{
          background: "transparent",
          border: "none",
          color: PEN_INK,
          fontFamily: "'Homemade Apple', cursive",
          fontSize: "1.05em",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(-1.5deg) scale(1.03)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
      >
        <svg
          viewBox="0 0 200 60"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.85 }}
        >
          <path
            d="M18 30 C 14 12, 60 6, 100 8 S 190 10, 184 30 S 150 54, 100 52 S 10 52, 18 30 S 40 14, 60 11"
            fill="rgba(60, 30, 5, 0.06)"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span className="relative">✒ Sign the Book</span>
      </button>
    </form>
  );

  const cornerFlourish = (pos: "tl" | "tr" | "bl" | "br") => {
    const base: React.CSSProperties = {
      position: "absolute",
      width: 22,
      height: 22,
      pointerEvents: "none",
      color: GOLD_DIM,
      opacity: 0.8,
    };
    const posStyle: Record<string, React.CSSProperties> = {
      tl: { top: 6, left: 6 },
      tr: { top: 6, right: 6, transform: "scaleX(-1)" },
      bl: { bottom: 6, left: 6, transform: "scaleY(-1)" },
      br: { bottom: 6, right: 6, transform: "scale(-1,-1)" },
    };
    return (
      <svg viewBox="0 0 22 22" style={{ ...base, ...posStyle[pos] }}>
        <path
          d="M2 2 L10 2 M2 2 L2 10 M4 4 Q4 8 8 8 M4 4 Q8 4 8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    );
  };

  const renderPageNav = (isRight: boolean) => (
    <div
      className="text-center mt-auto pt-2 flex-shrink-0"
      style={{ color: INK_FADED, fontFamily: scriptDisplay, fontSize: "0.75em", position: "relative", zIndex: 5 }}
    >
      {page * 2 + (isRight ? 2 : 1)} of {totalPages * 2}
    </div>
  );

  // A dog-ear on the page's outer bottom corner. Click it to turn the page, like the newspaper's corner.
  const renderEar = (dir: "next" | "prev") => {
    const enabled = !flipping && (dir === "next" ? page < totalPages - 1 : page > 0);
    if (!enabled) return null;
    return (
      <button
        type="button"
        aria-label={dir === "next" ? "Turn the page" : "Turn back"}
        title={dir === "next" ? "Turn the page" : "Turn back"}
        className={`page-ear ${dir === "next" ? "right" : "left"}`}
        style={{ zIndex: 7 }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startFlip(dir);
        }}
      >
        <svg viewBox="0 0 60 60" aria-hidden="true">
          <defs>
            <linearGradient id="earUnder" x1="1" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#a8894f" />
              <stop offset="1" stopColor="#8c7040" />
            </linearGradient>
            <linearGradient id="earFlap" x1="1" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#cfb37c" />
              <stop offset="0.5" stopColor="#bb9d66" />
              <stop offset="1" stopColor="#a3864f" />
            </linearGradient>
            <filter id="earShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="-2" dy="-2" stdDeviation="1.6" floodColor="#3a2412" floodOpacity="0.4" />
            </filter>
            {/* parchment grain multiplied over the ear, and a slightly ragged edge */}
            <filter id="earWear" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="6" result="grain" />
              <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.55 0" result="tint" />
              <feComposite in="tint" in2="SourceGraphic" operator="in" result="grainOnEar" />
              <feBlend in="SourceGraphic" in2="grainOnEar" mode="multiply" result="worn" />
              <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="9" result="n" />
              <feDisplacementMap in="worn" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <radialGradient id="earFox" cx="0.25" cy="0.3" r="0.5">
              <stop offset="0" stopColor="rgba(90, 50, 10, 0.35)" />
              <stop offset="1" stopColor="rgba(90, 50, 10, 0)" />
            </radialGradient>
          </defs>
          <g filter="url(#earWear)">
            {/* the page beneath, with the page block's rounded outer corner */}
            <path d="M60 0 V 50 Q 60 60 50 60 H 0 Z" fill="url(#earUnder)" />
            {/* the folded flap: a gentle curl along the fold, a rounded tip */}
            <path d="M0 60 Q 28 32 60 0 L 7 0 Q 0 0 0 7 Z" fill="url(#earFlap)" filter="url(#earShadow)" />
            {/* the tip has been thumbed: darker and a little foxed */}
            <path d="M0 60 Q 28 32 60 0 L 7 0 Q 0 0 0 7 Z" fill="url(#earFox)" />
            <path d="M0 22 Q 10 12 22 0 L 7 0 Q 0 0 0 7 Z" fill="rgba(60, 30, 5, 0.22)" />
          </g>
        </svg>
      </button>
    );
  };

  const renderSideBody = (side: SideContent) => {
    if (side.type === "form") return renderForm();
    if (side.type === "cover" || side.type === "blank") return <div className="flex-1" />;
    return <div className="flex-1 min-h-0 overflow-hidden">{renderEntries(side.entries)}</div>;
  };

  const sideTitle = (side: SideContent, isRight: boolean) => {
    if (side.type === "form") return "Sign the Book";
    return "";
  };

  const renderPageSide = (
    side: SideContent,
    opts: { isRight: boolean; withNav: boolean }
  ) => side.type === "cover" ? (
    <div className="leather-face flex items-center justify-center" style={{ zIndex: 3 }}>
      <Engraving />
    </div>
  ) : (
    <div className="relative flex flex-col flex-1 min-h-0" style={{ zIndex: 2, backfaceVisibility: "hidden" }}>
      {sideTitle(side, opts.isRight) && (
        <h2
          className="mb-4 text-center"
          style={{
            color: INK,
            fontSize: "1.9em",
            fontFamily: scriptDisplay,
            lineHeight: 1.2,
            transform: "rotate(-1.5deg)",
          }}
        >
          <span className="relative inline-block">
            {sideTitle(side, opts.isRight)}
            <svg
              viewBox="0 0 120 12"
              preserveAspectRatio="none"
              className="absolute left-0 right-0"
              style={{ bottom: -4, height: 10, width: "100%", opacity: 0.8 }}
            >
              <path d={FLOURISHES[0]} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
        </h2>
      )}
      {renderSideBody(side)}
      {opts.withNav && totalPages > 1 && side.type !== "blank" && renderPageNav(opts.isRight)}
    </div>
  );

  // Determine what to display underneath the flipping overlay.
  const cur = getPageContent(page);
  const tgt = flipping ? getPageContent(flipTargetRef.current) : cur;

  // Static layer:
  //  - Next flip: left stays OLD (until overlay covers it), right shows NEW.
  //  - Prev flip: right stays OLD (until overlay covers it), left shows NEW.
  const staticLeft = flipping && flipDir === "next" ? cur.left : tgt.left;
  const staticRight = flipping && flipDir === "prev" ? cur.right : tgt.right;

  // Overlay faces (physically: for next, the right page peels over and its back becomes the new left).
  const overlayFront = flipDir === "next" ? cur.right : cur.left;
  const overlayBack = flipDir === "next" ? tgt.left : tgt.right;

  const leftFrameShadow =
    "inset -4px 0 8px -4px rgba(80,40,10,0.35), inset 2px 0 4px -2px rgba(80,40,10,0.2)";
  const rightFrameShadow =
    "inset 4px 0 8px -4px rgba(80,40,10,0.35), inset -2px 0 4px -2px rgba(80,40,10,0.2)";

  // The ribbon marks the first page; it goes as soon as you turn away and comes back when you return.
  const ribbonVisible = page === 0 && !(flipping && flipDir === "next");

  return (
    <div className="h-full w-full" style={{ perspective: "1800px" }}>
      {ribbonVisible && onClose && (
        <button
          type="button"
          aria-label="Close the guestbook"
          title="Close"
          onClick={onClose}
          className="df-ribbon"
        />
      )}
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background: parchmentBg,
          borderRadius: "2px 6px 6px 2px",
          boxShadow:
            "inset 2px 0 12px rgba(60,30,10,0.35), inset 0 0 60px rgba(60,35,10,0.35)",
        }}
      >
        {/* gold rule around the pages: dips into the gutter and darkens there */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          style={{ zIndex: 6, overflow: "visible" }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pagesRule" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="rgba(201, 160, 74, 0.9)" />
              <stop offset="0.36" stopColor="rgba(190, 150, 70, 0.8)" />
              <stop offset="0.46" stopColor="rgba(110, 80, 30, 0.6)" />
              <stop offset="0.5" stopColor="rgba(50, 32, 10, 0.55)" />
              <stop offset="0.54" stopColor="rgba(110, 80, 30, 0.6)" />
              <stop offset="0.64" stopColor="rgba(190, 150, 70, 0.8)" />
              <stop offset="1" stopColor="rgba(201, 160, 74, 0.9)" />
            </linearGradient>
          </defs>
          <path
            d="M 1 1 H 410 L 450 4 L 480 9 L 500 12 L 520 9 L 550 4 L 590 1 H 999 V 999 H 1 Z"
            fill="none"
            stroke="url(#pagesRule)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* Desktop: two-page spread */}
        <div
          className="hidden md:grid grid-cols-2 h-full relative"
          style={{ fontFamily: scriptBody, fontSize: "1.05rem" }}
        >
          {/* Left page (static) */}
          <div
            className="flex flex-col p-5 relative overflow-hidden"
            style={{
              borderRight: `1px solid ${INK_FADED}44`,
              boxShadow: leftFrameShadow,
            }}
          >
            <div className="parchment-texture" />
            {cornerFlourish("tl")}
            {renderPageSide(staticLeft, { isRight: false, withNav: true })}
            {renderEar("prev")}
          </div>

          {/* Right page (static) */}
          <div
            className="flex flex-col p-5 relative overflow-hidden"
            style={{ boxShadow: rightFrameShadow }}
          >
            <div className="parchment-texture" />
            {cornerFlourish("tr")}
            {renderPageSide(staticRight, { isRight: true, withNav: true })}
            {renderEar("next")}
          </div>

          {/* Gutter: the pages bulge up out of the spine, so they shade into it and catch light on the ridge */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: "50%",
              width: "220px",
              transform: "translateX(-50%)",
              clipPath: onCover && !flipping ? "inset(0 50% 0 0)" : undefined,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,240,200,0.18) 30%, rgba(60,30,10,0.10) 38%, rgba(60,30,10,0.32) 46%, rgba(30,15,5,0.62) 50%, rgba(60,30,10,0.32) 54%, rgba(60,30,10,0.10) 62%, rgba(255,240,200,0.18) 70%, transparent 100%)",
              zIndex: 4,
            }}
          />

          {/* Flipping page overlay */}
          {flipping && (
            <div
              className="absolute top-0 pointer-events-none"
              style={{
                left: flipDir === "next" ? "50%" : "0",
                width: "50%",
                height: "100%",
                transformStyle: "preserve-3d",
                transformOrigin: flipDir === "next" ? "left center" : "right center",
                animation: `${flipDir === "next" ? "flipNext" : "flipPrev"} ${FLIP_MS}ms ease-in-out forwards`,
                willChange: "transform",
                zIndex: 20,
              }}
            >
              {/* Front face — the outgoing side */}
              {!pastMidpoint && (
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  background: overlayFront.type === "cover" ? "#2b1309" : parchmentBg,
                  borderRadius: flipDir === "next" ? "0 8px 8px 0" : "3px 0 0 3px",
                  boxShadow:
                    flipDir === "next"
                      ? "inset 4px 0 8px -4px rgba(80,40,10,0.35), 2px 0 12px rgba(0,0,0,0.3)"
                      : "inset -4px 0 8px -4px rgba(80,40,10,0.35), -2px 0 12px rgba(0,0,0,0.3)",
                }}
              >
                <div className="flex flex-col p-5 relative h-full">
                  {renderPageSide(overlayFront, {
                    isRight: flipDir === "next",
                    withNav: false,
                  })}
                </div>
              </div>
              )}
              {/* Back face — the incoming side after the flip */}
              {pastMidpoint && (
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: overlayBack.type === "cover" ? "#2b1309" : parchmentBg,
                  borderRadius: flipDir === "next" ? "3px 0 0 3px" : "0 8px 8px 0",
                  boxShadow:
                    "inset 0 0 8px rgba(80,40,10,0.35), 0 0 12px rgba(0,0,0,0.25)",
                }}
              >
                <div className="flex flex-col p-5 relative h-full">
                  {renderPageSide(overlayBack, {
                    isRight: flipDir === "prev",
                    withNav: false,
                  })}
                </div>
              </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile: single column stacked */}
        <div
          className="md:hidden flex flex-col h-full overflow-y-auto relative no-scrollbar"
          style={{ fontFamily: scriptBody, fontSize: "1.05rem" }}
        >
          <div className="parchment-texture" />
          {page === 0 && (
            <div className="p-4 relative">
              {cornerFlourish("tl")}
              {cornerFlourish("tr")}
              <h2
                className="mb-4 text-center"
                style={{
                  color: INK,
                  fontSize: "1.8em",
                  fontFamily: scriptDisplay,
                  lineHeight: 1.2,
                  transform: "rotate(-1.5deg)",
                }}
              >
                <span className="relative inline-block">
                  Sign the Book
                  <svg
                    viewBox="0 0 120 12"
                    preserveAspectRatio="none"
                    className="absolute left-0 right-0"
                    style={{ bottom: -4, height: 10, width: "100%", opacity: 0.8 }}
                  >
                    <path d={FLOURISHES[0]} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
              {renderForm()}
            </div>
          )}

          <div
            className="p-4 relative"
            style={page === 0 ? { borderTop: `1px dashed ${INK_FADED}66` } : {}}
          >
            {page !== 0 && cornerFlourish("tl")}
            {page !== 0 && cornerFlourish("tr")}
            {cornerFlourish("bl")}
            {cornerFlourish("br")}
            {page === 0
              ? renderEntries(entries.slice(0, ENTRIES_PER_SIDE))
              : (() => {
                  const content = getPageContent(page);
                  const combined = [
                    ...(content.left.type === "entries" ? content.left.entries : []),
                    ...(content.right.type === "entries" ? content.right.entries : []),
                  ];
                  return renderEntries(combined);
                })()}
            {totalPages > 1 && renderPageNav(true)}
            {renderEar("prev")}
            {renderEar("next")}
          </div>
        </div>

      </div>

      {/* Page-flip keyframes */}
      <style>{`
        @keyframes flipNext {
          0%   { transform: rotateY(0deg);   box-shadow: 0 0 0 rgba(0,0,0,0); }
          50%  { box-shadow: -10px 0 24px rgba(0,0,0,0.35); }
          100% { transform: rotateY(-180deg); box-shadow: 0 0 0 rgba(0,0,0,0); }
        }
        @keyframes flipPrev {
          0%   { transform: rotateY(0deg);   box-shadow: 0 0 0 rgba(0,0,0,0); }
          50%  { box-shadow: 10px 0 24px rgba(0,0,0,0.35); }
          100% { transform: rotateY(180deg); box-shadow: 0 0 0 rgba(0,0,0,0); }
        }
      `}</style>
    </div>
  );
};
