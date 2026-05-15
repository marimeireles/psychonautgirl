import { useMemo } from "react";
import { Newspaper } from "lucide-react";
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
    <div className="win95-border-inset bg-white h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 win95-border-bottom">
        <div className="flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Les Temps Mariannes</h1>
            <p className="text-sm text-muted-foreground mt-1">{today}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        <section>
          {news.map((item, index) => (
            <div key={index} className="py-3 border-b border-border/50">
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
        </section>
      </div>
    </div>
  );
};
