// The Blind 75, in the original order and grouping of the list
// (Array, Binary, Dynamic Programming, Graph, Interval, Linked List, Matrix, String, Tree, Heap).
// Progress is stored in ukiepc_progress under the key `b75:<slug>`, so it shares
// the login and the done/tried cycling with the training plan.

export interface B75Problem {
  /** LeetCode problem number, shown next to the title */
  num: number;
  title: string;
  /** LeetCode slug → https://leetcode.com/problems/<slug>/ */
  slug: string;
  /** needs LeetCode premium */
  premium?: boolean;
}

export interface B75Category {
  name: string;
  problems: B75Problem[];
}

export const b75Key = (p: B75Problem) => `b75:${p.slug}`;

export const blind75: B75Category[] = [
  {
    name: "Array",
    problems: [
      { num: 1, title: "Two Sum", slug: "two-sum" },
      { num: 121, title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock" },
      { num: 217, title: "Contains Duplicate", slug: "contains-duplicate" },
      { num: 238, title: "Product of Array Except Self", slug: "product-of-array-except-self" },
      { num: 53, title: "Maximum Subarray", slug: "maximum-subarray" },
      { num: 152, title: "Maximum Product Subarray", slug: "maximum-product-subarray" },
      { num: 153, title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array" },
      { num: 33, title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array" },
      { num: 15, title: "3Sum", slug: "3sum" },
      { num: 11, title: "Container With Most Water", slug: "container-with-most-water" },
    ],
  },
  {
    name: "Binary",
    problems: [
      { num: 371, title: "Sum of Two Integers", slug: "sum-of-two-integers" },
      { num: 191, title: "Number of 1 Bits", slug: "number-of-1-bits" },
      { num: 338, title: "Counting Bits", slug: "counting-bits" },
      { num: 268, title: "Missing Number", slug: "missing-number" },
      { num: 190, title: "Reverse Bits", slug: "reverse-bits" },
    ],
  },
  {
    name: "Dynamic Programming",
    problems: [
      { num: 70, title: "Climbing Stairs", slug: "climbing-stairs" },
      { num: 322, title: "Coin Change", slug: "coin-change" },
      { num: 300, title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence" },
      { num: 1143, title: "Longest Common Subsequence", slug: "longest-common-subsequence" },
      { num: 139, title: "Word Break", slug: "word-break" },
      { num: 377, title: "Combination Sum IV", slug: "combination-sum-iv" },
      { num: 198, title: "House Robber", slug: "house-robber" },
      { num: 213, title: "House Robber II", slug: "house-robber-ii" },
      { num: 91, title: "Decode Ways", slug: "decode-ways" },
      { num: 62, title: "Unique Paths", slug: "unique-paths" },
      { num: 55, title: "Jump Game", slug: "jump-game" },
    ],
  },
  {
    name: "Graph",
    problems: [
      { num: 133, title: "Clone Graph", slug: "clone-graph" },
      { num: 207, title: "Course Schedule", slug: "course-schedule" },
      { num: 417, title: "Pacific Atlantic Water Flow", slug: "pacific-atlantic-water-flow" },
      { num: 200, title: "Number of Islands", slug: "number-of-islands" },
      { num: 128, title: "Longest Consecutive Sequence", slug: "longest-consecutive-sequence" },
      { num: 269, title: "Alien Dictionary", slug: "alien-dictionary", premium: true },
      { num: 261, title: "Graph Valid Tree", slug: "graph-valid-tree", premium: true },
      { num: 323, title: "Number of Connected Components in an Undirected Graph", slug: "number-of-connected-components-in-an-undirected-graph", premium: true },
    ],
  },
  {
    name: "Interval",
    problems: [
      { num: 57, title: "Insert Interval", slug: "insert-interval" },
      { num: 56, title: "Merge Intervals", slug: "merge-intervals" },
      { num: 435, title: "Non-overlapping Intervals", slug: "non-overlapping-intervals" },
      { num: 252, title: "Meeting Rooms", slug: "meeting-rooms", premium: true },
      { num: 253, title: "Meeting Rooms II", slug: "meeting-rooms-ii", premium: true },
    ],
  },
  {
    name: "Linked List",
    problems: [
      { num: 206, title: "Reverse Linked List", slug: "reverse-linked-list" },
      { num: 141, title: "Linked List Cycle", slug: "linked-list-cycle" },
      { num: 21, title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists" },
      { num: 19, title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list" },
      { num: 143, title: "Reorder List", slug: "reorder-list" },
    ],
  },
  {
    name: "Matrix",
    problems: [
      { num: 73, title: "Set Matrix Zeroes", slug: "set-matrix-zeroes" },
      { num: 54, title: "Spiral Matrix", slug: "spiral-matrix" },
      { num: 48, title: "Rotate Image", slug: "rotate-image" },
      { num: 79, title: "Word Search", slug: "word-search" },
    ],
  },
  {
    name: "String",
    problems: [
      { num: 3, title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters" },
      { num: 424, title: "Longest Repeating Character Replacement", slug: "longest-repeating-character-replacement" },
      { num: 76, title: "Minimum Window Substring", slug: "minimum-window-substring" },
      { num: 242, title: "Valid Anagram", slug: "valid-anagram" },
      { num: 49, title: "Group Anagrams", slug: "group-anagrams" },
      { num: 20, title: "Valid Parentheses", slug: "valid-parentheses" },
      { num: 125, title: "Valid Palindrome", slug: "valid-palindrome" },
      { num: 5, title: "Longest Palindromic Substring", slug: "longest-palindromic-substring" },
      { num: 647, title: "Palindromic Substrings", slug: "palindromic-substrings" },
      { num: 271, title: "Encode and Decode Strings", slug: "encode-and-decode-strings", premium: true },
    ],
  },
  {
    name: "Tree",
    problems: [
      { num: 104, title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree" },
      { num: 100, title: "Same Tree", slug: "same-tree" },
      { num: 226, title: "Invert Binary Tree", slug: "invert-binary-tree" },
      { num: 124, title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum" },
      { num: 102, title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal" },
      { num: 297, title: "Serialize and Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree" },
      { num: 572, title: "Subtree of Another Tree", slug: "subtree-of-another-tree" },
      { num: 105, title: "Construct Binary Tree from Preorder and Inorder Traversal", slug: "construct-binary-tree-from-preorder-and-inorder-traversal" },
      { num: 98, title: "Validate Binary Search Tree", slug: "validate-binary-search-tree" },
      { num: 230, title: "Kth Smallest Element in a BST", slug: "kth-smallest-element-in-a-bst" },
      { num: 235, title: "Lowest Common Ancestor of a Binary Search Tree", slug: "lowest-common-ancestor-of-a-binary-search-tree" },
      { num: 208, title: "Implement Trie (Prefix Tree)", slug: "implement-trie-prefix-tree" },
      { num: 211, title: "Design Add and Search Words Data Structure", slug: "design-add-and-search-words-data-structure" },
      { num: 212, title: "Word Search II", slug: "word-search-ii" },
    ],
  },
  {
    name: "Heap",
    problems: [
      { num: 23, title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists" },
      { num: 347, title: "Top K Frequent Elements", slug: "top-k-frequent-elements" },
      { num: 295, title: "Find Median from Data Stream", slug: "find-median-from-data-stream" },
    ],
  },
];

export const blind75Count = blind75.reduce((n, c) => n + c.problems.length, 0); // 75
