import { useMemo } from "react";
import { parseNews } from "@/data/news";

export const NewsWindow = () => {
  const news = useMemo(() => parseNews(), []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Masthead */}
      <div className="text-center py-3 px-4 border-b-2 border-border flex-shrink-0">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">{today}</div>
        <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ fontFamily: "Georgia, serif" }}>
          Les Temps Mariannes
        </h1>
        <div className="h-px bg-border mt-2" />
        <div className="h-[2px] bg-foreground mt-0.5" />
      </div>

      {/* News list */}
      <div className="overflow-y-auto flex-1 min-h-0">
        {news.map((item, index) => (
          <div key={index} className="px-4 py-3 border-b border-border/50">
            <div className="text-xs text-muted-foreground mb-1">{item.Date}</div>
            {item.Link ? (
              <a
                href={item.Link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold hover:text-primary transition-colors"
              >
                {item.Title}
              </a>
            ) : (
              <div className="text-sm font-bold">{item.Title}</div>
            )}
            {item.Summary && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.Summary}</p>
            )}
          </div>
        ))}


      </div>
    </div>
  );
};
