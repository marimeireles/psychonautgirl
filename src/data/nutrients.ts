// Nutrients tracked on the /food page.
// `ids` are USDA FoodData Central nutrient ids; values from the API are per 100 g.
// Targets are adult daily reference intakes (US RDA / AI), picked by sex and,
// where it matters, age. Amino acid targets are the
// WHO/FAO/UNU 2007 adult requirements in mg per kg of body weight.

export type NutrientGroup = "macros" | "vitamins" | "minerals" | "aminos";

export interface TargetCtx {
  kg: number;
  kcalGoal: number;
  sex: "female" | "male";
  age: number;
  // exercise was ticked on this day or the day before (muscle is still rebuilding the day after)
  exercised?: boolean;
}

export interface NutrientDef {
  key: string;
  label: string;
  unit: string;
  group: NutrientGroup;
  ids: number[];
  // "first": take the first id present; "sum": add every id present
  combine?: "first" | "sum";
  target: (ctx: TargetCtx) => number;
  // true = the target is an upper limit, not something to reach
  limit?: boolean;
  // true = the body stores it, so it is judged over the past seven days (seven daily targets) rather than day by day
  weekly?: boolean;
}

const fixed = (n: number) => () => n;
const bySex = (female: number, male: number) => (ctx: TargetCtx) => (ctx.sex === "male" ? male : female);
// mg per kg per day -> grams per day
const perKg = (mgPerKg: number) => (ctx: TargetCtx) => (mgPerKg * ctx.kg) / 1000;

// grams of protein per kg of body weight: more on an exercise day and the day after, less on rest days
export const PROTEIN_G_PER_KG = 1.6; // upper end of the usual range for gaining weight
export const PROTEIN_G_PER_KG_REST = 1.2;
const proteinTarget = (c: TargetCtx) => (c.exercised ? PROTEIN_G_PER_KG : PROTEIN_G_PER_KG_REST) * c.kg;

export const nutrients: NutrientDef[] = [
  // macros
  { key: "kcal", label: "energy", unit: "kcal", group: "macros", ids: [1008, 2047, 2048], target: (c) => c.kcalGoal },
  { key: "protein", label: "protein", unit: "g", group: "macros", ids: [1003], target: proteinTarget },
  { key: "fat", label: "fat", unit: "g", group: "macros", ids: [1004], target: (c) => (0.3 * c.kcalGoal) / 9 },
  {
    key: "carbs",
    label: "carbs",
    unit: "g",
    group: "macros",
    ids: [1005],
    target: (c) => Math.max(0, c.kcalGoal - 0.3 * c.kcalGoal - 4 * proteinTarget(c)) / 4,
  },
  { key: "fiber", label: "fibre", unit: "g", group: "macros", ids: [1079], target: (c) => (14 * c.kcalGoal) / 1000 },
  // omega-3 fats: the long-chain ones from fish and algae (250 mg a day, EFSA), and plant ALA (US adequate intake).
  // DHA + EPA is counted by the week: a portion or two of oily fish covers it.
  { key: "omega3", label: "omega-3 DHA + EPA", unit: "g", group: "macros", ids: [1272, 1278], combine: "sum", target: fixed(0.25), weekly: true },
  { key: "ala", label: "omega-3 ALA", unit: "g", group: "macros", ids: [1404, 1270], target: bySex(1.1, 1.6) },

  // vitamins
  { key: "vitA", label: "vitamin A", unit: "µg", group: "vitamins", ids: [1106], target: bySex(700, 900) },
  { key: "vitC", label: "vitamin C", unit: "mg", group: "vitamins", ids: [1162], target: bySex(75, 90) },
  { key: "vitD", label: "vitamin D", unit: "µg", group: "vitamins", ids: [1114], target: fixed(15) },
  { key: "vitE", label: "vitamin E", unit: "mg", group: "vitamins", ids: [1109], target: fixed(15) },
  { key: "vitK", label: "vitamin K", unit: "µg", group: "vitamins", ids: [1185], target: bySex(90, 120) },
  { key: "b1", label: "B1 thiamin", unit: "mg", group: "vitamins", ids: [1165], target: bySex(1.1, 1.2) },
  { key: "b2", label: "B2 riboflavin", unit: "mg", group: "vitamins", ids: [1166], target: bySex(1.1, 1.3) },
  { key: "b3", label: "B3 niacin", unit: "mg", group: "vitamins", ids: [1167], target: bySex(14, 16) },
  { key: "b5", label: "B5 pantothenic", unit: "mg", group: "vitamins", ids: [1170], target: fixed(5) },
  { key: "b6", label: "B6", unit: "mg", group: "vitamins", ids: [1175], target: fixed(1.3) },
  { key: "folate", label: "folate", unit: "µg", group: "vitamins", ids: [1190, 1177], target: fixed(400) },
  { key: "b12", label: "B12", unit: "µg", group: "vitamins", ids: [1178], target: fixed(2.4) },
  { key: "choline", label: "choline", unit: "mg", group: "vitamins", ids: [1180], target: bySex(425, 550) },

  // minerals
  { key: "calcium", label: "calcium", unit: "mg", group: "minerals", ids: [1087], target: (c) => ((c.sex === "female" && c.age > 50) || c.age > 70 ? 1200 : 1000) },
  { key: "iron", label: "iron", unit: "mg", group: "minerals", ids: [1089], target: (c) => (c.sex === "female" && c.age <= 50 ? 18 : 8) },
  { key: "magnesium", label: "magnesium", unit: "mg", group: "minerals", ids: [1090], target: (c) => (c.sex === "male" ? (c.age <= 30 ? 400 : 420) : c.age <= 30 ? 310 : 320) },
  { key: "phosphorus", label: "phosphorus", unit: "mg", group: "minerals", ids: [1091], target: fixed(700) },
  { key: "potassium", label: "potassium", unit: "mg", group: "minerals", ids: [1092], target: bySex(2600, 3400) },
  { key: "zinc", label: "zinc", unit: "mg", group: "minerals", ids: [1095], target: bySex(8, 11) },
  { key: "copper", label: "copper", unit: "mg", group: "minerals", ids: [1098], target: fixed(0.9) },
  { key: "manganese", label: "manganese", unit: "mg", group: "minerals", ids: [1101], target: bySex(1.8, 2.3) },
  { key: "selenium", label: "selenium", unit: "µg", group: "minerals", ids: [1103], target: fixed(55) },
  { key: "sodium", label: "sodium", unit: "mg", group: "minerals", ids: [1093], target: fixed(2300), limit: true },

  // essential amino acids (grams)
  { key: "histidine", label: "histidine", unit: "g", group: "aminos", ids: [1221], target: perKg(10) },
  { key: "isoleucine", label: "isoleucine", unit: "g", group: "aminos", ids: [1212], target: perKg(20) },
  { key: "leucine", label: "leucine", unit: "g", group: "aminos", ids: [1213], target: perKg(39) },
  { key: "lysine", label: "lysine", unit: "g", group: "aminos", ids: [1214], target: perKg(30) },
  { key: "metcys", label: "methionine + cysteine", unit: "g", group: "aminos", ids: [1215, 1216], combine: "sum", target: perKg(15) },
  { key: "phetyr", label: "phenylalanine + tyrosine", unit: "g", group: "aminos", ids: [1217, 1218], combine: "sum", target: perKg(25) },
  { key: "threonine", label: "threonine", unit: "g", group: "aminos", ids: [1211], target: perKg(15) },
  { key: "tryptophan", label: "tryptophan", unit: "g", group: "aminos", ids: [1210], target: perKg(4) },
  { key: "valine", label: "valine", unit: "g", group: "aminos", ids: [1219], target: perKg(26) },
];

export const nutrientGroups: { id: NutrientGroup; title: string }[] = [
  { id: "macros", title: "macros" },
  { id: "vitamins", title: "vitamins" },
  { id: "minerals", title: "minerals" },
  { id: "aminos", title: "essential amino acids" },
];

// key -> amount per 100 g
export type Per100 = Record<string, number>;

// Turn the API's nutrient list into our compact per-100g map.
export const toPer100 = (list: { nutrientId: number; value?: number }[]): Per100 => {
  const byId = new Map<number, number>();
  for (const n of list) if (typeof n.value === "number") byId.set(n.nutrientId, n.value);
  const out: Per100 = {};
  for (const def of nutrients) {
    const present = def.ids.filter((id) => byId.has(id));
    if (present.length === 0) continue;
    out[def.key] = def.combine === "sum" ? present.reduce((s, id) => s + byId.get(id)!, 0) : byId.get(present[0])!;
  }
  return out;
};

// Bumped when nutrients are added to the list above; diary entries logged under an
// older version get the new ones filled in from the food database (see fetchNutrients).
export const NUTRIENTS_VERSION = 2;

export const hasAminos = (p: Per100) => p.lysine !== undefined || p.leucine !== undefined;

export const fmtAmount = (v: number, unit: string) => {
  if (unit === "kcal") return String(Math.round(v));
  if (v >= 100) return String(Math.round(v));
  if (v >= 10) return v.toFixed(1).replace(/\.0$/, "");
  return v.toFixed(2).replace(/\.?0+$/, "") || "0";
};
