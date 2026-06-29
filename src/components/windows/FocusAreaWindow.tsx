import { ExternalLink } from "lucide-react";
import { getFocusArea, getCardsForFocusArea } from "@/data/focusAreas";
import { GeneratedCardImage } from "@/components/GeneratedCardImage";

interface FocusAreaWindowProps {
  focusAreaId: string;
}

export const FocusAreaWindow = ({ focusAreaId }: FocusAreaWindowProps) => {
  const area = getFocusArea(focusAreaId);
  const cards = area ? getCardsForFocusArea(area.id) : [];

  if (!area) {
    return (
      <div className="win95-border-inset bg-white h-full p-4 text-sm text-muted-foreground">
        Focus area not found.
      </div>
    );
  }

  return (
    <div className="win95-border-inset bg-white h-full overflow-y-auto">
      <div
        className="p-5 win95-border-bottom"
        style={{ background: `linear-gradient(135deg, ${area.color}22, ${area.color}08)` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{area.icon}</span>
          <h2 className="text-2xl font-bold" style={{ color: area.color }}>
            {area.name}
          </h2>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <p className="text-sm leading-relaxed text-foreground">{area.description}</p>

        {cards.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Projects
            </h3>
            <ul className="space-y-3">
              {cards.map((card, i) => (
                <li
                  key={i}
                  className="win95-border bg-card p-3 flex gap-3 items-start"
                >
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.caption}
                      className="w-32 h-32 object-cover flex-shrink-0 pointer-events-none rounded-sm"
                    />
                  ) : (
                    <GeneratedCardImage
                      seed={card.caption}
                      className="w-32 h-32 flex-shrink-0 rounded-sm"
                    />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <span className="text-sm font-semibold">{card.caption}</span>
                    {card.summary && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {card.summary}
                      </p>
                    )}
                    {card.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {card.links.map((link, j) => (
                          <a
                            key={j}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            draggable={false}
                            className="win95-border bg-card hover:bg-muted/40 transition-colors cursor-pointer text-xs px-2 py-1 inline-flex items-center gap-1"
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
