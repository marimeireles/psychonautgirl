// Food lookup against USDA FoodData Central (free, CORS-enabled).
// A personal key (https://api.data.gov/signup/) goes in .env as VITE_FDC_API_KEY;
// without one the shared DEMO_KEY is used, which only allows ~10 requests an hour.
import { toPer100, type Per100 } from "@/data/nutrients";

const API_KEY: string = import.meta.env.VITE_FDC_API_KEY || "DEMO_KEY";
export const usingDemoKey = API_KEY === "DEMO_KEY";

export interface Portion {
  label: string;
  grams: number;
}

export interface FoodHit {
  fdcId: number;
  name: string;
  source: string; // "dish" (survey foods, incl. mixed dishes) or "ingredient"
  per100: Per100;
  portions: Portion[];
  defaultGrams: number;
}

export interface ParsedQuery {
  text: string;
  grams?: number; // "mango curry 160g"
  count?: number; // "2 fried eggs"
}

// "mango curry 160g" -> { text: "mango curry", grams: 160 }; "2 fried eggs" -> { text: "fried eggs", count: 2 }
export const parseQuery = (raw: string): ParsedQuery => {
  let text = raw.trim();
  let grams: number | undefined;
  let count: number | undefined;
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|gr|grams?|ml)\b/i);
  if (m) {
    const n = parseFloat(m[1].replace(",", "."));
    grams = /^kg$/i.test(m[2]) ? n * 1000 : n;
    text = (text.slice(0, m.index) + " " + text.slice(m.index! + m[0].length)).trim();
  } else {
    const c = text.match(/^(\d+(?:[.,]\d+)?)\s+(?=\S)/);
    if (c) {
      count = parseFloat(c[1].replace(",", "."));
      text = text.slice(c[0].length).trim();
    }
  }
  return { text: text.replace(/\s+/g, " "), grams, count };
};

const CACHE_KEY = "food_search_cache";
const CACHE_MAX = 40;

const readCache = (): Record<string, FoodHit[]> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeCache = (q: string, hits: FoodHit[]) => {
  try {
    const cache = readCache();
    delete cache[q];
    cache[q] = hits;
    const keys = Object.keys(cache);
    for (const k of keys.slice(0, Math.max(0, keys.length - CACHE_MAX))) delete cache[k];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* storage full: skip caching */
  }
};

interface ApiFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients?: { nutrientId: number; value?: number }[];
  foodMeasures?: { disseminationText?: string; gramWeight?: number; rank?: number }[];
}

export const searchFoods = async (text: string): Promise<FoodHit[]> => {
  const q = text.trim().toLowerCase();
  if (!q) return [];
  const cached = readCache()[q];
  if (cached) return cached;

  // POST with a JSON body: the GET form of this endpoint intermittently answers 400 when dataType is set
  const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(API_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: q, pageSize: 12, dataType: ["Survey (FNDDS)", "SR Legacy", "Foundation"] }),
  });
  if (res.status === 429) {
    throw new Error(usingDemoKey ? "the shared demo key hit its hourly limit" : "food database hourly limit reached, try again later");
  }
  if (!res.ok) throw new Error(`food database error (${res.status})`);
  const json = (await res.json()) as { foods?: ApiFood[] };

  const hits: FoodHit[] = (json.foods ?? [])
    .map((f) => {
      const measures = (f.foodMeasures ?? [])
        .filter((m) => typeof m.gramWeight === "number" && m.gramWeight! > 0 && m.disseminationText)
        .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
      const unspecified = measures.find((m) => /quantity not specified/i.test(m.disseminationText!));
      const portions = measures
        .filter((m) => !/quantity not specified/i.test(m.disseminationText!))
        .slice(0, 5)
        .map((m) => ({ label: m.disseminationText!.toLowerCase(), grams: m.gramWeight! }));
      return {
        fdcId: f.fdcId,
        name: f.description.toLowerCase(),
        source: f.dataType.startsWith("Survey") ? "dish" : "ingredient",
        per100: toPer100(f.foodNutrients ?? []),
        portions,
        defaultGrams: unspecified?.gramWeight ?? portions[0]?.grams ?? 100,
      };
    })
    .filter((h) => h.per100.kcal !== undefined);

  writeCache(q, hits);
  return hits;
};
