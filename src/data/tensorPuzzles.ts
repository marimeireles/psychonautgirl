// Tensor Puzzles (Sasha Rush): reimplement 21 NumPy-ish functions in one line of
// broadcasting each. https://github.com/srush/Tensor-Puzzles — runnable in Colab.
// Progress is stored in ukiepc_progress under the key `tp:<function-name>`.

export interface TensorPuzzle {
  id: string;
  name: string;
  what: string;
}

export const tensorPuzzlesRepoUrl = "https://github.com/srush/Tensor-Puzzles";
export const tensorPuzzlesColabUrl = "https://colab.research.google.com/github/srush/Tensor-Puzzles/blob/main/Tensor%20Puzzlers.ipynb";

export const tensorPuzzleRules = [
  "These puzzles are about broadcasting. Know this rule.",
  "Each puzzle needs to be solved in 1 line (<80 columns) of code.",
  "Allowed: @, arithmetic, comparison, shape, any indexing (a[:j], a[:, None], a[arange(10)]), and previous puzzle functions.",
  "Not allowed: anything else. No view, sum, take, squeeze, tensor.",
  "Two helpers to start from: arange(i) replaces a for-loop, where(q, a, b) replaces an if-statement.",
];

const p = (name: string, what: string): TensorPuzzle => ({ id: `tp:${name}`, name, what });

export const tensorPuzzles: TensorPuzzle[] = [
  p("ones", "the vector of all ones"),
  p("sum", "the sum of a vector"),
  p("outer", "the outer product of two vectors"),
  p("diag", "the diagonal vector of a square matrix"),
  p("eye", "the identity matrix"),
  p("triu", "the upper triangular matrix"),
  p("cumsum", "the cumulative sum"),
  p("diff", "the running difference"),
  p("vstack", "the matrix of two vectors stacked"),
  p("roll", "the vector shifted one circular position"),
  p("flip", "the reversed vector"),
  p("compress", "keep only masked entries, left-aligned"),
  p("pad_to", "eliminate or add 0s to change the vector's size"),
  p("sequence_mask", "pad out to a length per batch"),
  p("bincount", "count how many times each entry was seen"),
  p("scatter_add", "add together values that link to the same location"),
  p("flatten", "flatten a 2D matrix to a vector"),
  p("linspace", "evenly spaced values between two endpoints"),
  p("heaviside", "the Heaviside step function, using b where a is zero"),
  p("repeat", "repeat a vector along a new leading dimension"),
  p("bucketize", "assign each value to a bucket defined by boundaries"),
];
