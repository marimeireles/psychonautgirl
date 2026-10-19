import { supabase } from "@/lib/supabase";

export interface SiteVisit {
  id: number;
  country: string;
  country_code: string;
  region: string;
  city: string;
  created_at: string;
}

/**
 * Log one visit per browser session: the visitor's browser asks geojs.io where
 * its IP is located, and only the place names are stored — the IP never reaches
 * our database. Dev traffic (localhost) is skipped, and any failure is silent:
 * analytics must never break the site.
 */
export async function logVisit() {
  try {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return;
    if (sessionStorage.getItem("visit_logged")) return;
    sessionStorage.setItem("visit_logged", "1"); // set first so a slow API can't double-log

    const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
    if (!res.ok) return;
    const geo = await res.json();

    await supabase.from("site_visits").insert({
      country: geo.country || "unknown",
      country_code: (geo.country_code || "").toUpperCase(),
      region: geo.region || "",
      city: geo.city || "",
    });
  } catch {
    /* never surface analytics errors */
  }
}

/** "BR" -> 🇧🇷 (falls back to a globe for unknown codes) */
export const flagEmoji = (code: string) => {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
};
