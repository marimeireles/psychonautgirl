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
      "Omega-3 and iodine are estimates: about 0.4 g ALA out of its 1.8 g polyunsaturated fat, no DHA or EPA (a fungus makes none), and no iodine figure is published so it counts as none.",
    per100: {
      kcal: 85,
      protein: 11,
      fat: 2.9,
      carbs: 3,
      fiber: 6,
      omega3: 0,
      ala: 0.4,
      iodine: 0,
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
      "Omega-3 and iodine are estimated from the ingredients (taking about 18% pumpkin seeds and 16% sugar): a little ALA from the cashews and seeds, no DHA or EPA, and a few µg of iodine from the cashews.",
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
      iodine: 6,
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
