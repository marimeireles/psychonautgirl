import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { flagEmoji, type SiteVisit } from "@/lib/visitLog";

const isMissingTable = (error: { code?: string; message?: string } | null) =>
  !!error && (error.code === "42P01" || error.code === "PGRST205" || /relation .* does not exist|Could not find the table/i.test(error.message ?? ""));

const timeAgo = (iso: string) => {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
};

export const AnalyticsWindow = () => {
  const [visits, setVisits] = useState<SiteVisit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("site_visits")
        .select("id, country, country_code, region, city, created_at")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (!alive) return;
      if (error) {
        setError(isMissingTable(error) ? "table missing — run supabase-analytics-schema.sql in the Supabase SQL editor ✨" : error.message);
      } else {
        setVisits(data ?? []);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const byCountry = useMemo(() => {
    const counts = new Map<string, { country: string; code: string; n: number }>();
    for (const v of visits ?? []) {
      const key = v.country_code || v.country;
      const row = counts.get(key) ?? { country: v.country, code: v.country_code, n: 0 };
      row.n += 1;
      counts.set(key, row);
    }
    return [...counts.values()].sort((a, b) => b.n - a.n || a.country.localeCompare(b.country));
  }, [visits]);

  if (error) {
    return <div className="p-4 text-sm text-muted-foreground">{error}</div>;
  }
  if (visits === null) {
    return <div className="p-4 text-sm text-muted-foreground animate-pulse">counting visitors…</div>;
  }

  const total = visits.length;
  const max = byCountry[0]?.n ?? 1;
  const recent = visits.slice(0, 8);

  return (
    <div className="p-3 text-sm flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
      {/* headline numbers */}
      <div className="grid grid-cols-2 gap-2">
        <div className="win95-border-inset bg-muted/60 px-3 py-2 text-center">
          <div className="text-xl font-bold text-primary">{total}</div>
          <div className="text-xs text-muted-foreground">visits logged</div>
        </div>
        <div className="win95-border-inset bg-muted/60 px-3 py-2 text-center">
          <div className="text-xl font-bold text-primary">{byCountry.length}</div>
          <div className="text-xs text-muted-foreground">countries</div>
        </div>
      </div>

      {total === 0 && (
        <div className="text-muted-foreground text-xs">
          no visits yet — the site logs one anonymous location per visitor session (country/city only, never the IP).
        </div>
      )}

      {/* countries */}
      {byCountry.length > 0 && (
        <div>
          <div className="font-bold mb-1">Where visitors are from</div>
          <div className="flex flex-col gap-1">
            {byCountry.map((c) => (
              <div key={c.code || c.country} className="flex items-center gap-2">
                <span className="text-base w-6 text-center">{flagEmoji(c.code)}</span>
                <span className="flex-1 truncate">{c.country}</span>
                <div className="w-28 h-3 win95-border-inset bg-muted/50 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary/70 to-accent" style={{ width: `${(100 * c.n) / max}%` }} />
                </div>
                <span className="w-10 text-right font-mono text-xs">{c.n}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* recent */}
      {recent.length > 0 && (
        <div>
          <div className="font-bold mb-1">Latest visits</div>
          <div className="flex flex-col gap-0.5 text-xs">
            {recent.map((v) => (
              <div key={v.id} className="flex items-center gap-2">
                <span>{flagEmoji(v.country_code)}</span>
                <span className="flex-1 truncate">{[v.city, v.region, v.country].filter(Boolean).join(", ")}</span>
                <span className="text-muted-foreground">{timeAgo(v.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-[10px] text-muted-foreground border-t border-border pt-1">
        privacy: each visitor's browser looks up its own location; only country/region/city are stored — never IPs, nothing else.
      </div>
    </div>
  );
};
