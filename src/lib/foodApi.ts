// Food lookup against USDA FoodData Central (free, CORS-enabled).
// A personal key (https://api.data.gov/signup/) goes in .env as VITE_FDC_API_KEY;
// without one the shared DEMO_KEY is used, which only allows ~10 requests an hour.
import { hasAminos, nutrients, toPer100, type Per100 } from "@/data/nutrients";

const API_KEY: string = import.meta.env.VITE_FDC_API_KEY || "DEMO_KEY";
export const usingDemoKey = API_KEY === "DEMO_KEY";

export interface Portion {
  label: string;
  grams: number;
}

export interface FoodHit {
  fdcId: number;
  name: string;
  source: string; // "dish" (survey foods, incl. mixed dishes), "ingredient", or "mine" (src/data/myFoods.ts)
  per100: Per100;
  portions: Portion[];
  defaultGrams: number;
  note?: string;
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

const CACHE_KEY = "food_search_cache_v2"; // v2: omega-3 and iodine added
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

// ---------- amino acids for dishes ----------
// USDA's survey foods ("dishes") carry no amino acid values at all, only the plain
// ingredient foods do. A dish does list its ingredients with weights though, so we
// look those up, work out the amino acids per gram of protein of the mix, and scale
// that to the dish's own protein figure. It is an estimate, but a close one.
const AMINO_KEYS = nutrients.filter((n) => n.group === "aminos").map((n) => n.key);
const AMINO_CACHE_KEY = "food_amino_cache";

interface Ingredient {
  code: number;
  grams: number;
}
interface SearchFood extends ApiFood {
  ndbNumber?: number | string;
  foodCode?: number | string;
  finalFoodInputFoods?: { srCode?: number; gramWeight?: number }[];
}
// grams of protein that had amino data, and the grams of each amino acid that came with it
interface Mix {
  protein: number;
  aminos: Per100;
}

const post = async (body: unknown): Promise<SearchFood[]> => {
  const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(API_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`food database error (${res.status})`);
  return ((await res.json()) as { foods?: SearchFood[] }).foods ?? [];
};

// survey food codes have 8 digits; anything shorter is a plain ingredient number
const isDishCode = (code: number) => code >= 10_000_000;

const mixOf = async (ingredients: Ingredient[], depth: number): Promise<Mix> => {
  const mix: Mix = { protein: 0, aminos: {} };
  const add = (protein: number, perProtein: Per100) => {
    mix.protein += protein;
    for (const k of AMINO_KEYS) if (perProtein[k] !== undefined) mix.aminos[k] = (mix.aminos[k] ?? 0) + perProtein[k] * protein;
  };
  const list = ingredients.filter((i) => i.grams > 0).slice(0, 40);
  const plain = list.filter((i) => !isDishCode(i.code));
  const dishes = depth < 3 ? list.filter((i) => isDishCode(i.code)) : [];

  if (plain.length > 0) {
    const foods = await post({ query: plain.map((i) => `ndbNumber:${i.code}`).join(" "), pageSize: plain.length + 5, dataType: ["SR Legacy"] });
    for (const i of plain) {
      const f = foods.find((x) => Number(x.ndbNumber) === i.code);
      if (!f) continue;
      const p = toPer100(f.foodNutrients ?? []);
      if (!hasAminos(p) || !(p.protein > 0)) continue;
      const perProtein: Per100 = {};
      for (const k of AMINO_KEYS) if (p[k] !== undefined) perProtein[k] = p[k] / p.protein;
      add((p.protein * i.grams) / 100, perProtein);
    }
  }
  if (dishes.length > 0) {
    const foods = await post({ query: dishes.map((i) => `foodCode:${i.code}`).join(" "), pageSize: dishes.length + 5, dataType: ["Survey (FNDDS)"] });
    for (const i of dishes) {
      const f = foods.find((x) => Number(x.foodCode) === i.code);
      const protein = f ? toPer100(f.foodNutrients ?? []).protein : undefined;
      if (!f || !(protein! > 0)) continue;
      const sub = await mixOf(
        (f.finalFoodInputFoods ?? []).map((x) => ({ code: Number(x.srCode), grams: x.gramWeight ?? 0 })).filter((x) => x.code > 0 && x.code !== i.code),
        depth + 1,
      );
      if (!(sub.protein > 0)) continue;
      const perProtein: Per100 = {};
      for (const k of AMINO_KEYS) if (sub.aminos[k] !== undefined) perProtein[k] = sub.aminos[k] / sub.protein;
      add((protein! * i.grams) / 100, perProtein);
    }
  }
  return mix;
};

const readAminoCache = (): Record<string, Per100 | null> => {
  try {
    return JSON.parse(localStorage.getItem(AMINO_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

// Amino acids per 100 g for a food that came without them, or null when they cannot be worked out.
// Throws on network / rate-limit trouble so the caller can try again another time.
export const estimateAminos = async (fdcId: number, proteinPer100: number): Promise<Per100 | null> => {
  const cache = readAminoCache();
  if (fdcId in cache) return cache[fdcId];

  const res = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${encodeURIComponent(API_KEY)}`);
  if (!res.ok && res.status !== 404) throw new Error(`food database error (${res.status})`);
  let out: Per100 | null = null;
  if (res.ok) {
    const food = (await res.json()) as { inputFoods?: { ingredientCode?: number; ingredientWeight?: number }[] };
    const mix = await mixOf(
      (food.inputFoods ?? []).map((x) => ({ code: Number(x.ingredientCode), grams: x.ingredientWeight ?? 0 })).filter((x) => x.code > 0),
      0,
    );
    if (mix.protein > 0) {
      out = {};
      for (const k of AMINO_KEYS) if (mix.aminos[k] !== undefined) out[k] = Math.round((mix.aminos[k] / mix.protein) * proteinPer100 * 1000) / 1000;
    }
  }
  try {
    localStorage.setItem(AMINO_CACHE_KEY, JSON.stringify({ ...readAminoCache(), [fdcId]: out }));
  } catch {
    /* storage full: skip caching */
  }
  return out;
};

// ---------- nutrients added after an entry was logged ----------
// Per-100 g values of the given nutrient keys for foods already in the diary, by fdcId.
// Foods the database has no value for come back with an empty map.
// (This endpoint filters by the nutrient's old three-digit "number", not its id.)
const NUMBERS: Record<string, { numbers: string[]; sum?: boolean }> = {
  omega3: { numbers: ["621", "629"], sum: true }, // DHA + EPA
  ala: { numbers: ["851", "619"] }, // ALA, else all 18:3
  iodine: { numbers: ["314"] },
};

export const fetchNutrients = async (fdcIds: number[], keys: string[]): Promise<Record<number, Per100>> => {
  const wanted = keys.filter((k) => NUMBERS[k]);
  const numbers = wanted.flatMap((k) => NUMBERS[k].numbers);
  const out: Record<number, Per100> = {};
  for (let i = 0; i < fdcIds.length; i += 20) {
    const ids = fdcIds.slice(i, i + 20);
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods?api_key=${encodeURIComponent(API_KEY)}&fdcIds=${ids.join(",")}&format=abridged&nutrients=${numbers.join(",")}`,
    );
    if (!res.ok) throw new Error(`food database error (${res.status})`);
    const foods = (await res.json()) as { fdcId: number; foodNutrients?: { number?: string; amount?: number }[] }[];
    for (const id of ids) out[id] = {};
    for (const f of foods) {
      const byNumber = new Map<string, number>();
      for (const n of f.foodNutrients ?? []) if (n.number && typeof n.amount === "number") byNumber.set(n.number, n.amount);
      const per100: Per100 = {};
      for (const k of wanted) {
        const present = NUMBERS[k].numbers.filter((n) => byNumber.has(n));
        if (present.length === 0) continue;
        per100[k] = NUMBERS[k].sum ? present.reduce((s, n) => s + byNumber.get(n)!, 0) : byNumber.get(present[0])!;
      }
      out[f.fdcId] = per100;
    }
  }
  return out;
};
