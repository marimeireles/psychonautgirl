// Calorie maths for the /food page. Nothing here is specific to one person:
// every number is derived from the profile saved in the diary's settings row
// and the latest weigh-in, so the targets move as the weight does.

export type Sex = "female" | "male";
export type Activity = "sitting" | "light" | "moderate" | "very";
export type ExerciseLevel = "light" | "medium" | "high";

export interface Profile {
  sex: Sex;
  age: number;
  heightCm: number;
  startKg: number;
  goalKg: number;
  // how active an ordinary day is, before any logged exercise
  activity: Activity;
  // how fast to move towards the goal weight, kg per week
  paceKg: number;
  // set to pin the daily goal by hand instead of calculating it
  kcalOverride?: number | null;
}

// standard multipliers applied to resting energy use
export const ACTIVITIES: { id: Activity; label: string; factor: number }[] = [
  { id: "sitting", label: "mostly sitting", factor: 1.2 },
  { id: "light", label: "lightly active", factor: 1.375 },
  { id: "moderate", label: "moderately active", factor: 1.55 },
  { id: "very", label: "very active", factor: 1.725 },
];

// kcal burnt per kg of body weight: roughly a 45-minute walk, an hour of
// moderate effort, an hour of hard effort
export const EXERCISE: { level: ExerciseLevel; label: string; hint: string; kcalPerKg: number }[] = [
  { level: "light", label: "light", hint: "a walk, gentle yoga", kcalPerKg: 3.5 },
  { level: "medium", label: "medium", hint: "an hour of cycling, a class", kcalPerKg: 7 },
  { level: "high", label: "high", hint: "a hard run, a long hike", kcalPerKg: 10.5 },
];

export const MAX_PACE_KG = 0.5; // per week; faster than this is not a sensible target
const KCAL_PER_KG = 7700; // energy in a kilogram of body weight
const round10 = (n: number) => Math.round(n / 10) * 10;

export interface Energy {
  resting: number; // Mifflin-St Jeor resting energy use
  maintenance: number; // holds weight steady on a day without exercise
  goal: number; // daily target on a day without exercise
  exercise: Record<ExerciseLevel, number>; // added to goal and maintenance that day
}

export const computeEnergy = (p: Profile, kg: number): Energy => {
  const resting = 10 * kg + 6.25 * p.heightCm - 5 * p.age + (p.sex === "male" ? 5 : -161);
  const factor = ACTIVITIES.find((a) => a.id === p.activity)?.factor ?? 1.375;
  const maintenance = round10(resting * factor);
  // eat above maintenance to gain, below to lose, at maintenance once within 250 g of the goal
  const gap = p.goalKg - kg;
  const direction = Math.abs(gap) < 0.25 ? 0 : Math.sign(gap);
  const perDay = (Math.min(MAX_PACE_KG, Math.max(0, p.paceKg)) * KCAL_PER_KG) / 7;
  // never aim below resting energy use
  const calculated = Math.max(round10(resting), round10(maintenance + direction * perDay));
  const exercise = Object.fromEntries(EXERCISE.map((x) => [x.level, round10(x.kcalPerKg * kg)])) as Record<ExerciseLevel, number>;
  return { resting: round10(resting), maintenance, goal: p.kcalOverride && p.kcalOverride > 0 ? p.kcalOverride : calculated, exercise };
};
