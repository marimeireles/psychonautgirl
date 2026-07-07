import { useMemo, useRef, useState } from "react";
import { parseNews } from "@/data/news";

const PAGE_SIZE = 12;

const NEWSPRINT_LIGHT = "#f7f7f5";
const NEWSPRINT = "#d9d9d5";
const NEWSPRINT_DARK = "#b0b0ac";
const INK = "#151515";

const paperBg = `
  radial-gradient(ellipse at 10% 5%, rgba(20,20,20,0.04) 0%, transparent 45%),
  radial-gradient(ellipse at 92% 96%, rgba(20,20,20,0.10) 0%, transparent 45%),
  linear-gradient(180deg, ${NEWSPRINT_LIGHT} 0%, ${NEWSPRINT} 55%, ${NEWSPRINT_DARK} 110%)
`;

const masthead = "'UnifrakturMaguntia', 'UnifrakturCook', 'Old English Text MT', serif";
const displaySerif = "'Playfair Display', 'Times New Roman', serif";
const bodySerif = "'Lora', 'Georgia', serif";

export const NewsWindow = () => {
  const news = useMemo(() => parseNews(), []);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(news.length / PAGE_SIZE));
  const pageItems = news.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const [lead, ...rest] = pageItems;

  const goPage = (delta: number) => {
    const next = Math.max(0, Math.min(totalPages - 1, page + delta));
    if (next === page) return;
    setPage(next);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto"
      style={{
        background: paperBg,
        color: INK,
        fontFamily: bodySerif,
        border: `1px solid ${INK}`,
      }}
    >
      {/* Masthead */}
      <div className="text-center pt-5 pb-2 px-4" style={{ borderBottom: `4px double ${INK}` }}>
        <div
          className="uppercase mb-1"
          style={{
            fontFamily: displaySerif,
            fontSize: "0.7em",
            letterSpacing: "0.35em",
          }}
        >
          ✦ Berlin ✦ Est. MMXXV ✦
        </div>
        <h1
          style={{
            fontFamily: masthead,
            fontSize: "3em",
            lineHeight: 1,
            letterSpacing: "1px",
            margin: "6px 0 4px",
            textShadow: "0 1px 0 rgba(0,0,0,0.15)",
          }}
        >
          Les Temps Mariannes
        </h1>
      </div>

      {/* Dateline bar */}
      <div
        className="flex justify-between items-center py-1 px-4"
        style={{
          borderBottom: `1px solid ${INK}`,
          fontFamily: displaySerif,
          fontSize: "0.7em",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        <span>Vol. LXIX</span>
        <span>{today}</span>
        <span>Price: 1 BTC</span>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Lead story */}
        {lead && (
          <article
            className="mb-5 pb-5 text-center"
            style={{ borderBottom: `2px solid ${INK}` }}
          >
            <div
              className="mb-2"
              style={{
                fontFamily: displaySerif,
                fontSize: "0.65em",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
              }}
            >
              ~ Latest Story ~
            </div>
            <h2
              style={{
                fontFamily: displaySerif,
                fontWeight: 900,
                fontSize: "1.8em",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}
            >
              {lead.Title.trim()}
            </h2>
            <div
              className="mt-2"
              style={{
                fontFamily: displaySerif,
                fontSize: "0.75em",
                fontStyle: "italic",
                letterSpacing: "0.15em",
              }}
            >
              — {lead.Date.trim()} —
            </div>
            {lead.Summary && (
              <p
                className="mt-3 mx-auto"
                style={{
                  fontFamily: bodySerif,
                  fontSize: "0.95em",
                  lineHeight: 1.55,
                  fontStyle: "italic",
                  maxWidth: "42em",
                }}
              >
                {lead.Summary.trim()}
              </p>
            )}
            {lead.Link && (
              <div className="mt-2">
                <a
                  href={lead.Link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: INK,
                    fontFamily: displaySerif,
                    fontSize: "0.7em",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    borderBottom: `1px solid ${INK}`,
                  }}
                >
                  Continue reading →
                </a>
              </div>
            )}
          </article>
        )}

        {/* Other stories in two columns */}
        {rest.length > 0 && (
          <div
            style={{
              columnCount: 2,
              columnGap: "2em",
              columnRule: `1px solid ${INK}`,
            }}
          >
            {rest.map((item, i) => (
              <article
                key={i}
                className="mb-4 pb-4"
                style={{
                  breakInside: "avoid",
                  borderBottom: `1px dashed ${INK}55`,
                }}
              >
                <h3
                  style={{
                    fontFamily: displaySerif,
                    fontWeight: 700,
                    fontSize: "1.1em",
                    lineHeight: 1.2,
                    marginBottom: 4,
                  }}
                >
                  {item.Link ? (
                    <a
                      href={item.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {item.Title.trim()}
                    </a>
                  ) : (
                    item.Title.trim()
                  )}
                </h3>
                <div
                  style={{
                    fontFamily: displaySerif,
                    fontSize: "0.65em",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                    fontStyle: "italic",
                  }}
                >
                  {item.Date.trim()}
                </div>
                {item.Summary && (
                  <p
                    style={{
                      fontFamily: bodySerif,
                      fontSize: "0.9em",
                      lineHeight: 1.5,
                      textAlign: "justify",
                      hyphens: "auto",
                    }}
                  >
                    {item.Summary.trim()}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Footer — pagination when multiple pages, otherwise ornament */}
        {totalPages > 1 ? (
          <div
            className="flex items-center justify-center gap-6 mt-4 pt-3"
            style={{
              borderTop: `4px double ${INK}`,
              fontFamily: displaySerif,
              fontSize: "0.75em",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            <button
              onClick={() => goPage(-1)}
              disabled={page === 0}
              className="disabled:opacity-30 cursor-pointer"
              style={{
                color: INK,
                background: "transparent",
                border: "none",
                fontFamily: displaySerif,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                fontSize: "1em",
              }}
            >
              ◀ Prev
            </button>
            <span style={{ fontStyle: "italic", letterSpacing: "0.2em" }}>
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => goPage(1)}
              disabled={page >= totalPages - 1}
              className="disabled:opacity-30 cursor-pointer"
              style={{
                color: INK,
                background: "transparent",
                border: "none",
                fontFamily: displaySerif,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                fontSize: "1em",
              }}
            >
              Next ▶
            </button>
          </div>
        ) : (
          <div
            className="text-center mt-4 pt-3"
            style={{
              borderTop: `4px double ${INK}`,
              fontFamily: displaySerif,
              fontSize: "0.7em",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            ❦ Fin ❦
          </div>
        )}
      </div>
    </div>
  );
};
