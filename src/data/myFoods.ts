// Foods the USDA database does not know (or gets wrong), kept by hand.
// They autocomplete in the /food search box as you type and come first in its results.
//
// To add one, copy an entry and fill in what the label or a paper gives you:
//   name      what it is called in the diary (lowercase)
//   aliases   other words that should find it ("quorn" finds "mycoprotein")
//   per100    amounts per 100 g, keyed like `nutrients` in ./nutrients.ts
//             (kcal, protein, fat, carbs, fiber, vitC, iron, lysine, ...), in that
//             nutrient's unit. Leave out what you do not know; kcal is required.
//   portions  optional quick-pick sizes, e.g. { label: "1 fillet", grams: 60 }
//   defaultGrams  what the grams box starts at (100 if left out)
//   note      where the numbers came from
import type { Per100 } from "./nutrients";

export interface MyFood {
  name: string;
  aliases?: string[];
  per100: Per100 & { kcal: number };
  portions?: { label: string; grams: number }[];
  defaultGrams?: number;
  note?: string;
}

export const myFoods: MyFood[] = [
  {
    name: "mycoprotein (quorn)",
    aliases: ["quorn", "mycoprotein", "myco protein", "fusarium"],
    note:
      "Plain mycoprotein per 100 g as eaten (wet weight): Finnigan et al. 2019 (Curr Dev Nutr, table 1) and Holt et al. 2023 (J Agric Food Chem, table 4). " +
      "Amino acids are Holt's mg per g protein times 11 g protein. Quorn products (mince, pieces, fillets) are mostly mycoprotein but differ a little: check the pack. " +
      "Omega-3 is an estimate: about 0.4 g ALA out of its 1.8 g polyunsaturated fat, and no DHA or EPA (a fungus makes none).",
    per100: {
      kcal: 85,
      protein: 11,
      fat: 2.9,
      carbs: 3,
      fiber: 6,
      omega3: 0,
      ala: 0.4,
      b1: 0.1,
      b2: 0.3,
      folate: 114,
      choline: 180,
      calcium: 48,
      iron: 0.39,
      phosphorus: 290,
      potassium: 71,
      zinc: 7.6,
      selenium: 20,
      sodium: 5,
      histidine: 0.39,
      isoleucine: 0.57,
      leucine: 0.95,
      lysine: 0.91,
      threonine: 0.61,
      tryptophan: 0.18,
      valine: 0.6,
      // methionine and phenylalanine only: cysteine and tyrosine are not published, so these two read low
      metcys: 0.24,
      phetyr: 0.56,
    },
  },
  {
    name: "cashew clusters",
    aliases: ["cashew cluster", "nut clusters", "cashew almond pumpkin seed clusters"],
    note:
      "51% cashews, 15% almonds, cane sugar, pumpkin seeds. Energy, fat, carbs and protein are scaled up from a 30 g serving label (163 kcal, 10.7 g fat, 10.5 g carbs, 5.4 g protein). " +
      "Fibre and sodium are rough, taken from other brands' labels (about 1.5 g and 90 mg per 30 g). No vitamins, other minerals or amino acids. " +
      "Omega-3 is estimated from the ingredients (taking about 18% pumpkin seeds and 16% sugar): a little ALA from the cashews and seeds, and no DHA or EPA.",
    defaultGrams: 30,
    portions: [{ label: "serving (4–5 clusters)", grams: 30 }],
    per100: {
      kcal: 543,
      protein: 18,
      fat: 35.7,
      carbs: 35,
      fiber: 5,
      sodium: 300,
      omega3: 0,
      ala: 0.05,
    },
  },
  {
    name: "mango and passion fruit coop juice",
    aliases: ["co-op", "coop", "mango passionfruit juice", "mango passion fruit smoothie", "juice"],
    note:
      "From the carton label, which is per 100 ml: enter millilitres in the grams box (100 g here means 100 ml). " +
      "Apple juice 51%, mango purée 22%, banana purée 10%, apple purée 7%, passion fruit juice 5%, peach purée 4%, lemon juice 1%. " +
      "All 11 g of carbs are sugars. Sodium is the label's 0.01 g salt. No other vitamins, minerals or amino acids on the label. " +
      "Omega-3 is estimated from the ingredients: a trace of ALA from the mango and banana, and no DHA or EPA.",
    defaultGrams: 150,
    portions: [{ label: "glass (150 ml)", grams: 150 }],
    per100: {
      kcal: 46,
      protein: 0.5,
      fat: 0.5,
      carbs: 11,
      fiber: 0.8,
      vitC: 12,
      sodium: 4,
      omega3: 0,
      ala: 0.01,
    },
  },
  {
    name: "golden syrup porridge coop",
    aliases: ["co-op", "porridge sachet", "porridge oats", "golden syrup flavour porridge oat sachets", "oats", "oatmeal"],
    note:
      "Dry weight, from the pack label: oat flakes, sugar, flavouring. One sachet is 36 g; log the milk it is made with separately. " +
      "Energy, fat, carbs (21 g of the 65 g are sugars), fibre, protein and sodium (0.03 g salt) are the label's. " +
      "Everything else is an estimate from USDA plain rolled oats: vitamins, minerals and ALA taking the sachet as about 78% oats, amino acids scaled to the label's protein. " +
      "Selenium is left out, as it depends on where the oats grew. No DHA or EPA.",
    defaultGrams: 36,
    portions: [{ label: "sachet", grams: 36 }],
    per100: {
      kcal: 373,
      protein: 9.5,
      fat: 6.6,
      carbs: 65,
      fiber: 7.2,
      sodium: 12,
      omega3: 0,
      ala: 0.08,
      vitE: 0.33,
      vitK: 1.6,
      b1: 0.36,
      b2: 0.12,
      b3: 0.87,
      b5: 0.87,
      b6: 0.08,
      folate: 25,
      choline: 32,
      calcium: 41,
      iron: 3.3,
      magnesium: 108,
      phosphorus: 320,
      potassium: 282,
      zinc: 2.8,
      copper: 0.3,
      manganese: 2.8,
      histidine: 0.2,
      isoleucine: 0.36,
      leucine: 0.71,
      lysine: 0.46,
      metcys: 0.48,
      phetyr: 0.76,
      threonine: 0.28,
      tryptophan: 0.13,
      valine: 0.5,
    },
  },
  {
    name: "milk semi-skimmed",
    aliases: ["semi skimmed milk", "semiskimmed", "milk", "coop milk", "co-op"],
    note:
      "From the carton label, which is per 100 ml: enter millilitres in the grams box (100 g here means 100 ml). " +
      "Energy, fat, carbs (all sugars), protein, sodium (0.1 g salt), B12, calcium and potassium are the label's. " +
      "Everything else is an estimate from USDA 2% milk without added vitamins A and D (UK milk is not fortified): the other vitamins and minerals as listed there, amino acids scaled to the label's protein.",
    defaultGrams: 200,
    portions: [
      { label: "glass (200 ml)", grams: 200 },
      { label: "for a porridge sachet (180 ml)", grams: 180 },
      { label: "splash in tea (30 ml)", grams: 30 },
    ],
    per100: {
      kcal: 50,
      protein: 3.6,
      fat: 1.8,
      carbs: 4.8,
      fiber: 0,
      sodium: 40,
      b12: 0.3,
      calcium: 124,
      potassium: 161,
      omega3: 0,
      ala: 0.008,
      vitA: 28,
      vitC: 0.2,
      vitD: 0,
      vitE: 0.03,
      vitK: 0.2,
      b1: 0.039,
      b2: 0.185,
      b3: 0.092,
      b5: 0.356,
      b6: 0.038,
      folate: 5,
      choline: 16.4,
      iron: 0.02,
      magnesium: 11,
      phosphorus: 92,
      zinc: 0.48,
      copper: 0.006,
      manganese: 0.014,
      selenium: 2.5,
      histidine: 0.109,
      isoleucine: 0.187,
      leucine: 0.341,
      lysine: 0.301,
      metcys: 0.117,
      phetyr: 0.369,
      threonine: 0.154,
      tryptophan: 0.046,
      valine: 0.236,
    },
  },
];

// my foods whose name or aliases contain every word typed
export const matchMyFoods = (text: string): MyFood[] => {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return myFoods.filter((f) => {
    const hay = [f.name, ...(f.aliases ?? [])].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
};
