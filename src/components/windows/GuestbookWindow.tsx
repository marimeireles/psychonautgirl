import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

const ENTRIES_PER_SIDE = 2;
const FLIP_MS = 750;

const PARCHMENT = "#e9d3a2";
const PARCHMENT_DARK = "#c8a86a";
const INK = "#3a2412";
const INK_FADED = "#6b4a2b";
const GOLD = "#c9a04a";
const GOLD_DIM = "#8a6a2a";
const LEATHER = "#3a1a08";

const parchmentBg = `
  radial-gradient(ellipse at 20% 15%, rgba(255,240,200,0.4) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 85%, rgba(120,80,40,0.25) 0%, transparent 55%),
  radial-gradient(circle at 50% 50%, ${PARCHMENT} 0%, ${PARCHMENT_DARK} 130%)
`;

const scriptBody = "'IM Fell English', 'Caveat', serif";
const scriptDisplay = "'MedievalSharp', 'Uncial Antiqua', serif";
const blackletter = "'UnifrakturMaguntia', 'MedievalSharp', serif";

type SideContent =
  | { type: "form" }
  | { type: "entries"; entries: GuestbookEntry[] };

export const GuestbookWindow = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<"next" | "prev">("next");
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

  const totalPages =
    entries.length <= ENTRIES_PER_SIDE
      ? 1
      : 1 + Math.ceil((entries.length - ENTRIES_PER_SIDE) / (2 * ENTRIES_PER_SIDE));

  const getPageContent = (p: number): { left: SideContent; right: SideContent } => {
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
    setFlipping(true);
    window.setTimeout(() => {
      setPage(flipTargetRef.current);
      setFlipping(false);
    }, FLIP_MS);
  };

  const renderEntry = (entry: GuestbookEntry) => (
    <div
      key={entry.id}
      className="pb-3 mb-3"
      style={{ borderBottom: `1px dashed ${INK_FADED}66` }}
    >
      <div className="flex justify-between items-baseline mb-1">
        <span
          className="font-bold"
          style={{
            color: "#7a2f14",
            fontFamily: scriptDisplay,
            fontSize: "1.2em",
            letterSpacing: "0.5px",
          }}
        >
          {entry.name}
        </span>
        <span style={{ color: INK_FADED, fontSize: "0.8em", fontStyle: "italic" }}>
          {new Date(entry.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="leading-relaxed" style={{ color: INK, fontStyle: "italic" }}>
        {entry.message}
      </p>
    </div>
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
    return <div className="space-y-2">{list.map(renderEntry)}</div>;
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
            borderBottom: `1px solid ${INK_FADED}`,
            color: INK,
            fontFamily: scriptBody,
            fontSize: "1.1em",
          }}
          required
        />
      </div>
      <div>
        <label
          className="block mb-1"
          style={{ color: INK, fontFamily: scriptDisplay, fontSize: "1.05em" }}
        >
          ❧ A Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-transparent px-1 py-1 resize-none outline-none"
          style={{
            borderBottom: `1px solid ${INK_FADED}`,
            color: INK,
            fontFamily: scriptBody,
            fontSize: "1.1em",
          }}
          rows={3}
          required
        />
      </div>
      <button
        type="submit"
        className="px-4 py-1.5 rounded-sm transition-all"
        style={{
          background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DIM} 100%)`,
          color: LEATHER,
          border: `2px solid ${LEATHER}`,
          fontFamily: scriptDisplay,
          fontSize: "1.05em",
          letterSpacing: "1px",
          textShadow: "1px 1px 0 rgba(255,220,150,0.4)",
          boxShadow: "0 2px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,240,200,0.5)",
        }}
      >
        ✒ Sign the Book
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

  const renderPageNav = () => (
    <div
      className="flex items-center justify-center gap-4 mt-auto pt-3 flex-shrink-0"
      style={{ borderTop: `1px dashed ${INK_FADED}66`, position: "relative", zIndex: 5 }}
    >
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startFlip("prev");
        }}
        disabled={page === 0 || flipping}
        className="px-2 py-1 disabled:opacity-30 transition-all cursor-pointer"
        style={{
          color: LEATHER,
          fontFamily: scriptDisplay,
          fontSize: "0.8em",
          textShadow: "1px 1px 0 rgba(255,220,150,0.5)",
        }}
      >
        ☜ turn back
      </button>
      <span style={{ color: INK_FADED, fontFamily: scriptDisplay, fontStyle: "italic", fontSize: "0.8em" }}>
        folio {page + 1} of {totalPages}
      </span>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startFlip("next");
        }}
        disabled={page >= totalPages - 1 || flipping}
        className="px-2 py-1 disabled:opacity-30 transition-all cursor-pointer"
        style={{
          color: LEATHER,
          fontFamily: scriptDisplay,
          fontSize: "0.8em",
          textShadow: "1px 1px 0 rgba(255,220,150,0.5)",
        }}
      >
        turn forth ☞
      </button>
    </div>
  );

  const renderSideBody = (side: SideContent) => {
    if (side.type === "form") return renderForm();
    return <div className="flex-1 min-h-0 overflow-y-auto">{renderEntries(side.entries)}</div>;
  };

  const sideTitle = (side: SideContent, isRight: boolean) => {
    if (side.type === "form") return "Sign the Book";
    return isRight ? "Messages" : "Messages";
  };

  const renderPageSide = (
    side: SideContent,
    opts: { isRight: boolean; withNav: boolean }
  ) => (
    <>
      <h2
        className="mb-4 text-center"
        style={{
          color: LEATHER,
          fontSize: "2.4em",
          fontFamily: blackletter,
          lineHeight: 1.05,
          letterSpacing: "1px",
          textShadow: "1px 1px 0 rgba(255,220,150,0.5), 0 1px 0 rgba(0,0,0,0.15)",
        }}
      >
        {sideTitle(side, opts.isRight)}
      </h2>
      {renderSideBody(side)}
      {opts.withNav && totalPages > 1 && renderPageNav()}
    </>
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

  return (
    <div className="h-full w-full" style={{ perspective: "1800px" }}>
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background: parchmentBg,
          borderRadius: "3px 8px 8px 3px",
          boxShadow:
            "inset 2px 0 12px rgba(60,30,10,0.25), inset 0 0 40px rgba(80,50,20,0.15)",
          border: `2px solid ${GOLD_DIM}`,
        }}
      >
        {/* Desktop: two-page spread */}
        <div
          className="hidden md:grid grid-cols-2 h-full relative"
          style={{ fontFamily: scriptBody, fontSize: "1.05rem" }}
        >
          {/* Left page (static) */}
          <div
            className="flex flex-col p-5 relative"
            style={{
              borderRight: `1px solid ${INK_FADED}44`,
              boxShadow: leftFrameShadow,
            }}
          >
            {cornerFlourish("tl")}
            {cornerFlourish("bl")}
            {renderPageSide(staticLeft, { isRight: false, withNav: false })}
          </div>

          {/* Right page (static) */}
          <div
            className="flex flex-col p-5 relative"
            style={{ boxShadow: rightFrameShadow }}
          >
            {cornerFlourish("tr")}
            {cornerFlourish("br")}
            {renderPageSide(staticRight, { isRight: true, withNav: true })}
          </div>

          {/* Center spine shadow */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: "50%",
              width: "24px",
              transform: "translateX(-50%)",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(60,30,10,0.35) 45%, rgba(30,15,5,0.55) 50%, rgba(60,30,10,0.35) 55%, transparent 100%)",
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
                zIndex: 20,
              }}
            >
              {/* Front face — the outgoing side */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  background: parchmentBg,
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
              {/* Back face — the incoming side after the flip */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: parchmentBg,
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
            </div>
          )}
        </div>

        {/* Mobile: single column stacked */}
        <div
          className="md:hidden flex flex-col h-full overflow-y-auto"
          style={{ fontFamily: scriptBody, fontSize: "1.05rem" }}
        >
          {page === 0 && (
            <div className="p-4 relative">
              {cornerFlourish("tl")}
              {cornerFlourish("tr")}
              <h2
                className="mb-4 text-center"
                style={{
                  color: LEATHER,
                  fontSize: "2.2em",
                  fontFamily: blackletter,
                  lineHeight: 1.05,
                  letterSpacing: "1px",
                }}
              >
                Sign the Book
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
            <h2
              className="mb-4 text-center"
              style={{
                color: LEATHER,
                fontSize: "2.2em",
                fontFamily: blackletter,
                lineHeight: 1.05,
                letterSpacing: "1px",
              }}
            >
              Messages
            </h2>
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
            {totalPages > 1 && renderPageNav()}
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
