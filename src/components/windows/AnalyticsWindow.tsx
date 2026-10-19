import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { flagEmoji, type SiteVisit } from "@/lib/visitLog";

const isMissingTable = (error: { code?: string; message?: string } | null) =>
  !!error && (error.code === "42P01" || error.code === "PGRST205" || /relation .* does not exist|Could not find the table/i.test(error.message ?? ""));

const timeAgo = (iso: string) => {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const DAYS = 28;

/** retro performance graph: visits per day, pink line on a dark gridded panel */
const PerformanceGraph = ({ series, peak }: { series: number[]; peak: number }) => {
  const W = 320;
  const H = 110;
  const max = Math.max(peak, 1);
  const pts = series
    .map((v, i) => `${(i * W) / (series.length - 1 || 1)},${H - (v * (H - 8)) / max - 4}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28 block" preserveAspectRatio="none" style={{ background: "#2a1f33" }}>
      {/* grid */}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`v${i}`} x1={(i + 1) * (W / 8)} y1={0} x2={(i + 1) * (W / 8)} y2={H} stroke="#4a3a56" strokeWidth="1" />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={(i + 1) * (H / 5)} x2={W} y2={(i + 1) * (H / 5)} stroke="#4a3a56" strokeWidth="1" />
      ))}
      {/* area under the line */}
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill="rgba(255, 158, 203, 0.18)" />
      <polyline points={pts} fill="none" stroke="#ff9ecb" strokeWidth="2" />
    </svg>
  );
};

export const AnalyticsWindow = () => {
  const [visits, setVisits] = useState<SiteVisit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"performance" | "visitors">("performance");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("site_visits")
        .select("id, country, country_code, region, city, created_at")
        .order("created_at", { ascending: false })
        .limit(10000);
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

  // visits per day for the last DAYS days, oldest -> newest
  const series = useMemo(() => {
    const days = new Array(DAYS).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const v of visits ?? []) {
      const d = new Date(v.created_at);
      d.setHours(0, 0, 0, 0);
      const idx = DAYS - 1 - Math.round((today.getTime() - d.getTime()) / 86_400_000);
      if (idx >= 0 && idx < DAYS) days[idx] += 1;
    }
    return days;
  }, [visits]);

  const total = visits?.length ?? 0;
  const today = series[DAYS - 1] ?? 0;
  const peak = Math.max(...series, 0);
  const recent = (visits ?? []).slice(0, 10);

  const tabClass = (t: typeof tab) =>
    `px-3 py-0.5 text-xs win95-border ${tab === t ? "bg-card font-bold -mb-px border-b-0" : "bg-muted/60 text-muted-foreground"}`;

  return (
    <div className="flex flex-col text-sm h-full" style={{ minHeight: 0 }}>
      {/* menu bar, decorative like a proper 90s utility */}
      <div className="flex gap-3 px-2 py-0.5 text-xs border-b border-border bg-card select-none">
        {[
          { label: "Options", tip: "there are no options" },
          { label: "View", tip: "Yes, Vue" },
          { label: "Help", tip: "Aaaaarrrrrhhh!!!" },
        ].map((m) => (
          <span key={m.label} className="relative group/menu hover:bg-primary/20 px-1 cursor-default">
            <span className="underline">{m.label[0]}</span>
            {m.label.slice(1)}
            <span className="hidden group-hover/menu:block absolute left-0 top-full mt-1 w-max max-w-[180px] win95-border bg-card px-2 py-1 text-xs shadow-2xl z-[60] pointer-events-none">
              {m.tip}
            </span>
          </span>
        ))}
      </div>

      {/* tabs */}
      <div className="flex gap-1 px-2 pt-2">
        <button className={tabClass("performance")} onClick={() => setTab("performance")}>
          Performance
        </button>
        <button className={tabClass("visitors")} onClick={() => setTab("visitors")}>
          Visitors
        </button>
      </div>

      {/* tab body */}
      <div className="flex-1 overflow-y-auto win95-border bg-card mx-2 mb-1 p-2" style={{ minHeight: 0 }}>
        {error && <div className="text-xs text-muted-foreground p-2">{error}</div>}
        {!error && visits === null && <div className="text-xs text-muted-foreground p-2 animate-pulse">counting visitors…</div>}

        {!error && visits !== null && tab === "performance" && (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-muted-foreground">Visit History</div>
            <div className="win95-border-inset p-1">
              <PerformanceGraph series={series} peak={peak} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Totals", [["Visits", total], ["Countries", byCountry.length]]],
                ["Activity", [["Today", today], ["Peak day", peak]]],
              ].map(([title, rows]) => (
                <fieldset key={title as string} className="win95-border px-2 pb-1">
                  <legend className="text-[10px] px-1 text-muted-foreground">{title as string}</legend>
                  {(rows as [string, number][]).map(([label, value]) => (
                    <div key={label} className="flex justify-between text-xs font-mono">
                      <span>{label}</span>
                      <span className="text-primary font-bold">{value}</span>
                    </div>
                  ))}
                </fieldset>
              ))}
            </div>
          </div>
        )}

        {!error && visits !== null && tab === "visitors" && (
          <div className="flex flex-col gap-2">
            {/* processes-style country table */}
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {["Country", "Visits", "%"].map((h) => (
                    <th key={h} className="win95-border bg-muted/70 px-2 py-0.5 text-left font-bold sticky top-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {byCountry.map((c) => (
                  <tr key={c.code || c.country} className="hover:bg-primary/15">
                    <td className="px-2 py-0.5 border-b border-border/50">
                      {flagEmoji(c.code)} {c.country}
                    </td>
                    <td className="px-2 py-0.5 border-b border-border/50 text-right w-14">{c.n}</td>
                    <td className="px-2 py-0.5 border-b border-border/50 text-right w-14">{total ? Math.round((100 * c.n) / total) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {recent.length > 0 && (
              <div>
                <div className="text-xs font-bold text-muted-foreground mb-0.5">Latest</div>
                <div className="flex flex-col gap-0.5 text-[11px]">
                  {recent.map((v) => (
                    <div key={v.id} className="flex items-center gap-1.5">
                      <span>{flagEmoji(v.country_code)}</span>
                      <span className="flex-1 truncate">{[v.city, v.region].filter(Boolean).join(", ") || v.country}</span>
                      <span className="text-muted-foreground font-mono">{timeAgo(v.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* status bar */}
      <div className="flex gap-1 px-2 pb-1 text-[11px]">
        {[`Visitors: ${total}`, `Countries: ${byCountry.length}`, `Today: ${today}`].map((s) => (
          <div key={s} className="win95-border-inset bg-muted/60 px-2 py-0.5 flex-1 truncate">
            {s}
          </div>
        ))}
      </div>
      <div className="px-2 pb-2 text-[10px] text-muted-foreground">
        visit logging is anonymous and we only log your country/city of access
      </div>
    </div>
  );
};
