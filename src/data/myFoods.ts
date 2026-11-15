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
      "Amino acids are Holt's mg per g protein times 11 g protein. Quorn products (mince, pieces, fillets) are mostly mycoprotein but differ a little: check the pack.",
    per100: {
      kcal: 85,
      protein: 11,
      fat: 2.9,
      carbs: 3,
      fiber: 6,
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
