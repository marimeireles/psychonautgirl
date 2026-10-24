// The NeetCode roadmap (https://neetcode.io/roadmap) as a DAG: 18 topic nodes,
// arrows meaning "learn this first". Each node carries learning resources and
// the Blind 75 problems that train the topic. Exercises are referenced by their
// LeetCode slug, so progress shares the `b75:<slug>` keys (and the checkmark
// cycling) with the blind 75 tab.

export interface RoadmapResource {
  label: string;
  url: string;
}

export interface RoadmapNode {
  id: string;
  name: string;
  /** center of the node on the tree canvas, in px of a 900-wide layout */
  x: number;
  /** tree depth, 0-based; vertical position derives from it */
  row: number;
  resources: RoadmapResource[];
  /** Blind 75 slugs that practice this topic */
  slugs: string[];
}

const neet = (q: string): RoadmapResource => ({
  label: "neetcode videos",
  url: `https://www.youtube.com/@NeetCode/search?query=${encodeURIComponent(q)}`,
});

export const roadmapUrl = "https://neetcode.io/roadmap";

export const roadmapNodes: RoadmapNode[] = [
  {
    id: "arrays", name: "Arrays & Hashing", x: 450, row: 0,
    resources: [neet("hash table"), { label: "hash tables", url: "https://en.wikipedia.org/wiki/Hash_table" }],
    slugs: [
      "two-sum", "contains-duplicate", "valid-anagram", "group-anagrams", "top-k-frequent-elements",
      "encode-and-decode-strings", "product-of-array-except-self", "longest-consecutive-sequence",
    ],
  },
  {
    id: "two-pointers", name: "Two Pointers", x: 340, row: 1,
    resources: [neet("two pointers"), { label: "usaco guide", url: "https://usaco.guide/silver/two-pointers" }],
    slugs: ["valid-palindrome", "3sum", "container-with-most-water"],
  },
  {
    id: "stack", name: "Stack", x: 560, row: 1,
    resources: [neet("stack"), { label: "stacks", url: "https://en.wikipedia.org/wiki/Stack_(abstract_data_type)" }],
    slugs: ["valid-parentheses"],
  },
  {
    id: "binary-search", name: "Binary Search", x: 200, row: 2,
    resources: [neet("binary search"), { label: "cp-algorithms", url: "https://cp-algorithms.com/num_methods/binary_search.html" }],
    slugs: ["find-minimum-in-rotated-sorted-array", "search-in-rotated-sorted-array"],
  },
  {
    id: "sliding-window", name: "Sliding Window", x: 450, row: 2,
    resources: [neet("sliding window"), { label: "usaco guide", url: "https://usaco.guide/gold/sliding-window" }],
    slugs: [
      "best-time-to-buy-and-sell-stock", "longest-substring-without-repeating-characters",
      "longest-repeating-character-replacement", "minimum-window-substring",
    ],
  },
  {
    id: "linked-list", name: "Linked List", x: 660, row: 2,
    resources: [neet("linked list"), { label: "linked lists", url: "https://en.wikipedia.org/wiki/Linked_list" }],
    slugs: [
      "reverse-linked-list", "merge-two-sorted-lists", "linked-list-cycle",
      "reorder-list", "remove-nth-node-from-end-of-list",
    ],
  },
  {
    id: "trees", name: "Trees", x: 430, row: 3,
    resources: [neet("binary tree"), { label: "tree traversal", url: "https://en.wikipedia.org/wiki/Tree_traversal" }],
    slugs: [
      "invert-binary-tree", "maximum-depth-of-binary-tree", "same-tree", "subtree-of-another-tree",
      "lowest-common-ancestor-of-a-binary-search-tree", "binary-tree-level-order-traversal",
      "validate-binary-search-tree", "kth-smallest-element-in-a-bst",
      "construct-binary-tree-from-preorder-and-inorder-traversal", "binary-tree-maximum-path-sum",
      "serialize-and-deserialize-binary-tree",
    ],
  },
  {
    id: "tries", name: "Tries", x: 215, row: 4,
    resources: [neet("trie"), { label: "tries", url: "https://en.wikipedia.org/wiki/Trie" }],
    slugs: ["implement-trie-prefix-tree", "design-add-and-search-words-data-structure", "word-search-ii"],
  },
  {
    id: "heap", name: "Heap / Priority Queue", x: 430, row: 4,
    resources: [neet("heap"), { label: "binary heaps", url: "https://en.wikipedia.org/wiki/Binary_heap" }],
    slugs: ["merge-k-sorted-lists", "find-median-from-data-stream"],
  },
  {
    id: "backtracking", name: "Backtracking", x: 645, row: 4,
    resources: [neet("backtracking"), { label: "backtracking", url: "https://en.wikipedia.org/wiki/Backtracking" }],
    slugs: ["word-search"],
  },
  {
    id: "intervals", name: "Intervals", x: 85, row: 5,
    resources: [neet("intervals"), { label: "interval scheduling", url: "https://en.wikipedia.org/wiki/Interval_scheduling" }],
    slugs: ["insert-interval", "merge-intervals", "non-overlapping-intervals", "meeting-rooms", "meeting-rooms-ii"],
  },
  {
    id: "greedy", name: "Greedy", x: 240, row: 5,
    resources: [neet("greedy"), { label: "greedy algorithms", url: "https://en.wikipedia.org/wiki/Greedy_algorithm" }],
    slugs: ["maximum-subarray", "jump-game"],
  },
  {
    id: "advanced-graphs", name: "Advanced Graphs", x: 400, row: 5,
    resources: [neet("dijkstra"), { label: "dijkstra", url: "https://cp-algorithms.com/graph/dijkstra.html" }],
    slugs: ["alien-dictionary"],
  },
  {
    id: "graphs", name: "Graphs", x: 565, row: 5,
    resources: [neet("graph"), { label: "bfs", url: "https://cp-algorithms.com/graph/breadth-first-search.html" }, { label: "dfs", url: "https://cp-algorithms.com/graph/depth-first-search.html" }],
    slugs: [
      "number-of-islands", "clone-graph", "pacific-atlantic-water-flow", "course-schedule",
      "graph-valid-tree", "number-of-connected-components-in-an-undirected-graph",
    ],
  },
  {
    id: "dp1", name: "1-D DP", x: 770, row: 5,
    resources: [neet("dynamic programming"), { label: "intro to dp", url: "https://cp-algorithms.com/dynamic_programming/intro-to-dp.html" }],
    slugs: [
      "climbing-stairs", "house-robber", "house-robber-ii", "longest-palindromic-substring",
      "palindromic-substrings", "decode-ways", "coin-change", "maximum-product-subarray",
      "word-break", "longest-increasing-subsequence", "combination-sum-iv",
    ],
  },
  {
    id: "dp2", name: "2-D DP", x: 565, row: 6,
    resources: [neet("2d dynamic programming"), { label: "dp", url: "https://en.wikipedia.org/wiki/Dynamic_programming" }],
    slugs: ["unique-paths", "longest-common-subsequence"],
  },
  {
    id: "bit", name: "Bit Manipulation", x: 770, row: 6,
    resources: [neet("bit manipulation"), { label: "cp-algorithms", url: "https://cp-algorithms.com/algebra/bit-manipulation.html" }],
    slugs: ["sum-of-two-integers", "number-of-1-bits", "counting-bits", "missing-number", "reverse-bits"],
  },
  {
    id: "math", name: "Math & Geometry", x: 660, row: 7,
    resources: [neet("matrix"), { label: "basic geometry", url: "https://cp-algorithms.com/geometry/basic-geometry.html" }],
    slugs: ["rotate-image", "spiral-matrix", "set-matrix-zeroes"],
  },
];

/** "learn this before that" arrows, as [from, to] node ids */
export const roadmapEdges: [string, string][] = [
  ["arrays", "two-pointers"],
  ["arrays", "stack"],
  ["two-pointers", "binary-search"],
  ["two-pointers", "sliding-window"],
  ["two-pointers", "linked-list"],
  ["binary-search", "trees"],
  ["linked-list", "trees"],
  ["trees", "tries"],
  ["trees", "heap"],
  ["trees", "backtracking"],
  ["heap", "intervals"],
  ["heap", "greedy"],
  ["heap", "advanced-graphs"],
  ["backtracking", "graphs"],
  ["backtracking", "dp1"],
  ["graphs", "advanced-graphs"],
  ["graphs", "dp2"],
  ["graphs", "math"],
  ["dp1", "dp2"],
  ["dp1", "bit"],
  ["bit", "math"],
];

// layout constants for the tree canvas
export const ROADMAP_W = 900;
export const ROADMAP_ROW_H = 105;
export const ROADMAP_PAD_Y = 50;
export const roadmapY = (row: number) => ROADMAP_PAD_Y + row * ROADMAP_ROW_H;
export const ROADMAP_H = roadmapY(7) + ROADMAP_PAD_Y;
