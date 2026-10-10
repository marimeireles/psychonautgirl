// Training plan for UKIEPC 2026, grouped by topic in the recommended order (UK & Ireland Programming Contest)
// Contest: Saturday 17 October 2026, 11:00–16:00 BST. https://ukiepc.info/2026/
// Progress keys are task ids, so reordering or regrouping tasks never loses progress.
// Progress is stored in Supabase (tables ukiepc_progress / ukiepc_solves).


export type TaskKind = "read" | "warmup" | "solve" | "do";

export interface Task {
  id: string;
  kind: TaskKind;
  title: string;
  detail?: string;
  url?: string;
  /** Kattis problem slug, e.g. "hello" → https://open.kattis.com/problems/hello */
  kattis?: string;
  /** LeetCode slug, e.g. "two-sum" → https://leetcode.com/problems/two-sum/ */
  leetcode?: string;
  /** HackerRank challenge slug, e.g. "python-print" */
  hackerrank?: string;
  /** the must-do items of the day, shown with a star */
  important?: boolean;
}

export interface Module {
  id: string;
  theme: string;
  why: string;
  tasks: Task[];
}

export const kattisUrl = (slug: string) => `https://open.kattis.com/problems/${slug}`;
export const leetcodeUrl = (slug: string) => `https://leetcode.com/problems/${slug}/`;
export const hackerrankUrl = (slug: string) => `https://www.hackerrank.com/challenges/${slug}/problem`;

export const taskHref = (t: Task) =>
  t.kattis ? kattisUrl(t.kattis) : t.leetcode ? leetcodeUrl(t.leetcode) : t.hackerrank ? hackerrankUrl(t.hackerrank) : t.url;

export const facts = [
  "Saturday 17 October 2026. Arrive 10:00, intro 10:30, contest 11:00–16:00 BST.",
  "Teams of up to 3 students, one computer. Phones and other devices are banned.",
  "Usually 8–12 problems, easiest to hardest is NOT the letter order.",
  "⭐ Rank = problems solved, ties broken by total time. Each wrong submission on a problem you later solve costs +20 minutes.",
  "Scoreboard freezes at 15:00. Until then you can see which problems other teams are solving: use it to pick your next problem.",
  "⭐ Printed material is allowed: up to 25 A4 pages (your Team Reference Document). No internet besides the judge system.",
  "Languages (TBC): Python 3.9 on PyPy 7.3, C++20, C17, Java 21, Kotlin, Rust. AI tools of any kind are banned.",
];

export const modules: Module[] = [
  {
    id: "m-basics",
    theme: "Complexity, sorting and the standard library",
    why: "Knowing what n allows is the first decision on every problem. n ≤ 10^5 means O(n log n), n ≤ 2000 means O(n²), n ≤ 20 means try every subset. Read the constraints before the story.",
    tasks: [
      { id: "d1-bigo", important: true, kind: "read", title: "USACO Guide: Time complexity (how to go from the constraints to the algorithm)", url: "https://usaco.guide/bronze/time-comp?lang=py", detail: "Rule of thumb for PyPy: ~10^7–10^8 simple operations per second. n≤12 → permutations, n≤25 → 2^n subsets, n≤500 → n³, n≤5000 → n², n≤10^6 → n log n, bigger → log n or maths." },
      { id: "d1-ds", kind: "read", title: "USACO Guide: Introduction to data structures (Python: list, dict, set, deque, heapq)", url: "https://usaco.guide/bronze/intro-ds?lang=py" },
      { id: "d1-sort", important: true, kind: "read", title: "USACO Guide: Sorting with custom comparators (key=, tuples, reverse)", url: "https://usaco.guide/silver/sorting-custom?lang=py" },
      { id: "d1-collections", kind: "read", title: "Python docs: collections (Counter, defaultdict, deque). Skim heapq, bisect, itertools too", url: "https://docs.python.org/3.9/library/collections.html" },
      { id: "d1-w1", kind: "warmup", title: "LeetCode 217 Contains Duplicate (set)", leetcode: "contains-duplicate" },
      { id: "d1-w2", kind: "warmup", title: "LeetCode 242 Valid Anagram (Counter)", leetcode: "valid-anagram" },
      { id: "d1-w3", kind: "warmup", title: "LeetCode 1122 Relative Sort Array (sort with a key)", leetcode: "relative-sort-array" },
      { id: "d1-w4", kind: "warmup", title: "LeetCode 347 Top K Frequent Elements (Counter + heapq)", leetcode: "top-k-frequent-elements" },
      { id: "d1-w5", kind: "warmup", title: "LeetCode 56 Merge Intervals (sort then sweep)", leetcode: "merge-intervals" },
      { id: "d1-w6", kind: "warmup", title: "LeetCode 179 Largest Number (custom comparator with functools.cmp_to_key)", leetcode: "largest-number" },
      { id: "d1-s1", important: true, kind: "solve", title: "Sort of Sorting (custom sort key, stable sort)", kattis: "sortofsorting" },
      { id: "d1-s2", kind: "solve", title: "Height Ordering (insertion count)", kattis: "height" },
      { id: "d1-s3", kind: "solve", title: "Cups (parse two formats, sort)", kattis: "cups" },
      { id: "d1-s4", kind: "solve", title: "Line Them Up (compare with sorted / reversed)", kattis: "lineup" },
      { id: "d1-s5", kind: "solve", title: "Grandpa Bernie (dict of lists, sort)", kattis: "grandpabernie" },
      { id: "d1-s6", kind: "solve", title: "Apaxiaaaaaaaaaaaans! (string compression)", kattis: "apaxiaaans" },
    ],
  },
  {
    id: "m-hash",
    theme: "Hash maps, sets and binary search",
    why: "Dicts and sets turn 'have I seen this' into O(1). Binary search on the answer turns 'find the minimum X such that…' into a yes/no check you can write in two minutes.",
    tasks: [
      { id: "d2-bs", important: true, kind: "read", title: "USACO Guide: Binary search (on an array and on the answer)", url: "https://usaco.guide/silver/binary-search?lang=py" },
      { id: "d2-bs2", kind: "read", title: "cp-algorithms: Binary search (the lo/hi invariant explained once, properly)", url: "https://cp-algorithms.com/num_methods/binary_search.html" },
      { id: "d2-w1", kind: "warmup", title: "LeetCode 1 Two Sum (dict of seen values)", leetcode: "two-sum" },
      { id: "d2-w2", kind: "warmup", title: "LeetCode 49 Group Anagrams (dict keyed by sorted string)", leetcode: "group-anagrams" },
      { id: "d2-w3", kind: "warmup", title: "LeetCode 704 Binary Search", leetcode: "binary-search" },
      { id: "d2-w4", kind: "warmup", title: "LeetCode 278 First Bad Version (first true)", leetcode: "first-bad-version" },
      { id: "d2-w5", important: true, kind: "warmup", title: "LeetCode 875 Koko Eating Bananas (binary search on the answer)", leetcode: "koko-eating-bananas" },
      { id: "d2-s1", kind: "solve", title: "Babelfish (dict lookup, blank-line separated input)", kattis: "babelfish" },
      { id: "d2-s2", kind: "solve", title: "Conformity (Counter of frozensets)", kattis: "conformity" },
      { id: "d2-s3", kind: "solve", title: "Secure Doors (set state simulation)", kattis: "securedoors" },
      { id: "d2-s6", kind: "solve", title: "Sum Sets (hash map, meet in the middle)", kattis: "sumsets" },
      { id: "d2-s5", important: true, kind: "solve", title: "Free Weights (binary search on the answer)", kattis: "freeweights" },
    ],
  },
  {
    id: "m-greedy",
    theme: "Greedy, prefix sums and two pointers",
    why: "These solve most of the easy half of a UKIEPC set. Before coding a greedy, say the exchange argument in one sentence. If you cannot, it is probably DP.",
    tasks: [
      { id: "d2-prefix", kind: "read", title: "USACO Guide: Prefix sums", url: "https://usaco.guide/silver/prefix-sums?lang=py" },
      { id: "d2-tp", kind: "read", title: "USACO Guide: Two pointers / sliding window", url: "https://usaco.guide/silver/two-pointers?lang=py" },
      { id: "d2-greedy", important: true, kind: "read", title: "USACO Guide: Greedy algorithms with sorting", url: "https://usaco.guide/silver/greedy-sorting?lang=py", detail: "Before coding a greedy, say the exchange argument in one sentence: 'swapping any two choices in my order cannot improve the result because…'. If you cannot say it, it is probably DP." },
      { id: "d2-w6", kind: "warmup", title: "LeetCode 303 Range Sum Query (prefix sums)", leetcode: "range-sum-query-immutable" },
      { id: "d2-w7", kind: "warmup", title: "LeetCode 560 Subarray Sum Equals K (prefix sums + dict)", leetcode: "subarray-sum-equals-k" },
      { id: "d2-w8", kind: "warmup", title: "LeetCode 1004 Max Consecutive Ones III (sliding window)", leetcode: "max-consecutive-ones-iii" },
      { id: "d2-w9", kind: "warmup", title: "LeetCode 455 Assign Cookies (greedy after sorting)", leetcode: "assign-cookies" },
      { id: "d2-w10", kind: "warmup", title: "LeetCode 881 Boats to Save People (greedy two pointers)", leetcode: "boats-to-save-people" },
      { id: "d2-s4", kind: "solve", title: "Shopaholic (greedy, sort descending)", kattis: "shopaholic" },
      { id: "d2-s7", kind: "solve", title: "Pivot (prefix max / suffix min)", kattis: "pivot" },
    ],
  },
  {
    id: "m-graphs",
    theme: "Graphs: BFS, DFS, components, grids, union-find",
    why: "Almost every UKIEPC set has a grid or graph problem in its easy-medium band. BFS on a grid with a direction array should be something you can type without thinking.",
    tasks: [
      { id: "d3-read", important: true, kind: "read", title: "USACO Guide: Graph traversal (adjacency lists, BFS, DFS, components)", url: "https://usaco.guide/silver/graph-traversal?lang=py" },
      { id: "d3-ff", kind: "read", title: "USACO Guide: Flood fill (BFS/DFS on a grid)", url: "https://usaco.guide/silver/flood-fill?lang=py" },
      { id: "d3-bfs", kind: "read", title: "cp-algorithms: Breadth-first search (shortest path in unweighted graphs, with code)", url: "https://cp-algorithms.com/graph/breadth-first-search.html" },
      { id: "d3-dsu", kind: "read", title: "USACO Guide: Disjoint Set Union", url: "https://usaco.guide/gold/dsu?lang=py", detail: "In PyPy write DFS with an explicit stack, not recursion. Grid BFS: dirs = [(1,0),(-1,0),(0,1),(0,-1)], a dist grid initialised to -1 doubles as the visited set." },
      { id: "d3-w1", kind: "warmup", title: "LeetCode 733 Flood Fill", leetcode: "flood-fill" },
      { id: "d3-w2", important: true, kind: "warmup", title: "LeetCode 200 Number of Islands (grid components)", leetcode: "number-of-islands" },
      { id: "d3-w3", important: true, kind: "warmup", title: "LeetCode 994 Rotting Oranges (multi-source BFS)", leetcode: "rotting-oranges" },
      { id: "d3-w4", kind: "warmup", title: "LeetCode 1091 Shortest Path in Binary Matrix (BFS distance)", leetcode: "shortest-path-in-binary-matrix" },
      { id: "d3-w5", kind: "warmup", title: "LeetCode 1971 Find if Path Exists in Graph (adjacency list)", leetcode: "find-if-path-exists-in-graph" },
      { id: "d3-w6", kind: "warmup", title: "LeetCode 547 Number of Provinces (components, try it with DSU)", leetcode: "number-of-provinces" },
      { id: "d3-w7", kind: "warmup", title: "LeetCode 752 Open the Lock (BFS over states, not a grid)", leetcode: "open-the-lock" },
      { id: "d3-w8", kind: "warmup", title: "LeetCode 684 Redundant Connection (DSU)", leetcode: "redundant-connection" },
      { id: "d3-s1", kind: "solve", title: "Reachable Roads (count components)", kattis: "reachableroads" },
      { id: "d3-s2", kind: "solve", title: "Where's My Internet?? (BFS from node 1)", kattis: "wheresmyinternet" },
      { id: "d3-s3", kind: "solve", title: "10 Kinds of People (grid components, many queries)", kattis: "10kindsofpeople" },
      { id: "d3-s4", kind: "solve", title: "Grid (BFS with variable jump length)", kattis: "grid" },
      { id: "d3-s5", kind: "solve", title: "Button Bashing (BFS over states)", kattis: "buttonbashing" },
      { id: "d3-s6", important: true, kind: "solve", title: "Fire! (multi-source BFS then BFS)", kattis: "fire2" },
      { id: "d3-s7", kind: "solve", title: "Union-Find (DSU template)", kattis: "unionfind" },
    ],
  },
  {
    id: "m-paths",
    theme: "Shortest paths, topological sort, MST",
    why: "Weighted shortest paths and dependency ordering are the medium band. Dijkstra with heapq, Kahn's algorithm and Kruskal with union-find cover nearly all of it.",
    tasks: [
      { id: "d4-read", important: true, kind: "read", title: "USACO Guide: Shortest paths (Dijkstra with a heap)", url: "https://usaco.guide/gold/shortest-paths?lang=py" },
      { id: "d4-dij", kind: "read", title: "cp-algorithms: Dijkstra (why the 'stale entry' check matters with heapq)", url: "https://cp-algorithms.com/graph/dijkstra.html" },
      { id: "d4-topo", kind: "read", title: "USACO Guide: Topological sort (Kahn's algorithm)", url: "https://usaco.guide/gold/toposort?lang=py" },
      { id: "d4-mst", kind: "read", title: "USACO Guide: Minimum spanning trees (Kruskal = sort edges + DSU)", url: "https://usaco.guide/gold/mst?lang=py" },
      { id: "d4-w1", important: true, kind: "warmup", title: "LeetCode 743 Network Delay Time (Dijkstra)", leetcode: "network-delay-time" },
      { id: "d4-w2", kind: "warmup", title: "LeetCode 1631 Path With Minimum Effort (Dijkstra on a grid)", leetcode: "path-with-minimum-effort" },
      { id: "d4-w3", important: true, kind: "warmup", title: "LeetCode 207 Course Schedule (cycle detection via Kahn)", leetcode: "course-schedule" },
      { id: "d4-w4", kind: "warmup", title: "LeetCode 210 Course Schedule II (output the order)", leetcode: "course-schedule-ii" },
      { id: "d4-w5", kind: "warmup", title: "LeetCode 1584 Min Cost to Connect All Points (Kruskal)", leetcode: "min-cost-to-connect-all-points" },
      { id: "d4-s1", important: true, kind: "solve", title: "Single source shortest path, non-negative weights (Dijkstra template)", kattis: "shortestpath1" },
      { id: "d4-s2", kind: "solve", title: "Get Shorty (Dijkstra, maximise a product)", kattis: "getshorty" },
      { id: "d4-s3", kind: "solve", title: "Flowery Trails (Dijkstra from both ends, count edges on shortest paths)", kattis: "flowerytrails" },
      { id: "d4-s4", kind: "solve", title: "Build Dependencies (topological sort)", kattis: "builddeps" },
      { id: "d4-s5", kind: "solve", title: "Minimum Spanning Tree (Kruskal)", kattis: "minspantree" },
    ],
  },
  {
    id: "m-strings",
    theme: "Strings",
    why: "String problems are usually 'careful implementation' problems: reading the statement precisely matters more than algorithms. Know split, join, slicing, Counter, and a stack for nested parsing.",
    tasks: [
      { id: "d4-w6", kind: "warmup", title: "LeetCode 14 Longest Common Prefix", leetcode: "longest-common-prefix" },
      { id: "d4-w7", kind: "warmup", title: "LeetCode 443 String Compression", leetcode: "string-compression" },
      { id: "d4-w8", kind: "warmup", title: "LeetCode 394 Decode String (stack-based parsing)", leetcode: "decode-string" },
      { id: "d4-str1", kind: "solve", title: "Detailed Differences (string diff)", kattis: "detaileddifferences" },
      { id: "d4-str2", kind: "solve", title: "Simon Says (prefix check)", kattis: "simonsays" },
      { id: "d4-str3", kind: "solve", title: "Quite a Problem (case-insensitive search)", kattis: "quiteaproblem" },
    ],
  },
  {
    id: "m-dp",
    theme: "Dynamic programming",
    why: "DP is the biggest single topic in the medium-hard band. The recipe: define the state in words, write the recurrence, decide the order, check the base case. In PyPy prefer iterative tables to recursion.",
    tasks: [
      { id: "d5-read", important: true, kind: "read", title: "USACO Guide: Introduction to DP (the recipe and the classic problems)", url: "https://usaco.guide/gold/intro-dp?lang=py" },
      { id: "d5-knap", important: true, kind: "read", title: "USACO Guide: Knapsack DP (0/1, unbounded, counting ways)", url: "https://usaco.guide/gold/knapsack?lang=py" },
      { id: "d5-lis", kind: "read", title: "cp-algorithms: Longest increasing subsequence (the n log n version with bisect)", url: "https://cp-algorithms.com/sequences/longest_increasing_subsequence.html" },
      { id: "d5-w1", kind: "warmup", title: "LeetCode 70 Climbing Stairs", leetcode: "climbing-stairs" },
      { id: "d5-w2", kind: "warmup", title: "LeetCode 198 House Robber (take or skip)", leetcode: "house-robber" },
      { id: "d5-w3", kind: "warmup", title: "LeetCode 53 Maximum Subarray (Kadane)", leetcode: "maximum-subarray" },
      { id: "d5-w4", kind: "warmup", title: "LeetCode 64 Minimum Path Sum (2D grid DP)", leetcode: "minimum-path-sum" },
      { id: "d5-w5", important: true, kind: "warmup", title: "LeetCode 322 Coin Change (min coins)", leetcode: "coin-change" },
      { id: "d5-w6", kind: "warmup", title: "LeetCode 518 Coin Change II (count ways)", leetcode: "coin-change-ii" },
      { id: "d5-w7", kind: "warmup", title: "LeetCode 416 Partition Equal Subset Sum (subset-sum knapsack)", leetcode: "partition-equal-subset-sum" },
      { id: "d5-w8", kind: "warmup", title: "LeetCode 300 Longest Increasing Subsequence (do both n² and n log n)", leetcode: "longest-increasing-subsequence" },
      { id: "d5-w9", kind: "warmup", title: "LeetCode 1143 Longest Common Subsequence (2D DP over two strings)", leetcode: "longest-common-subsequence" },
      { id: "d5-w10", kind: "warmup", title: "LeetCode 72 Edit Distance", leetcode: "edit-distance" },
      { id: "d5-s1", important: true, kind: "solve", title: "Knapsack (reconstruct the chosen items)", kattis: "knapsack" },
      { id: "d5-s2", kind: "solve", title: "Walrus Weights (subset sum closest to 1000)", kattis: "walrusweights" },
      { id: "d5-s3", kind: "solve", title: "Longest Increasing Subsequence (n log n, reconstruct)", kattis: "longincsubseq" },
      { id: "d5-s4", kind: "solve", title: "Exact Change (2D DP over coins and amount)", kattis: "exactchange" },
      { id: "d5-s5", kind: "solve", title: "Nikola (DP over position and jump length)", kattis: "nikola" },
      { id: "d5-s6", kind: "solve", title: "Spiderman's Workout (DP over step and height)", kattis: "spiderman" },
      { id: "d5-s7", kind: "solve", title: "Canonical Coin Systems (coin change, compare greedy vs DP)", kattis: "canonical" },
    ],
  },
  {
    id: "m-maths",
    theme: "Maths and geometry",
    why: "Number theory shows up as a quick problem almost every year: gcd, modular exponentiation, a sieve. Geometry is rarer; cross product and the shoelace formula cover the usual cases.",
    tasks: [
      { id: "d6-read", important: true, kind: "read", title: "USACO Guide: Modular arithmetic (pow(a, b, m), inverses, nCr mod p)", url: "https://usaco.guide/gold/modular?lang=py" },
      { id: "d6-sieve", kind: "read", title: "cp-algorithms: Sieve of Eratosthenes", url: "https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html" },
      { id: "d6-geo", kind: "read", title: "cp-algorithms: Basic geometry (vectors, dot and cross product) and area of a polygon", url: "https://cp-algorithms.com/geometry/basic-geometry.html", detail: "Use integers everywhere you can. Cross product sign gives orientation; shoelace gives area. Only convert to float at the very end." },
      { id: "d6-w1", kind: "warmup", title: "LeetCode 204 Count Primes (sieve)", leetcode: "count-primes" },
      { id: "d6-w2", kind: "warmup", title: "LeetCode 50 Pow(x, n) (fast exponentiation)", leetcode: "powx-n" },
      { id: "d6-w3", kind: "warmup", title: "LeetCode 1071 Greatest Common Divisor of Strings (gcd)", leetcode: "greatest-common-divisor-of-strings" },
      { id: "d6-w4", kind: "warmup", title: "LeetCode 171 Excel Sheet Column Number (base conversion)", leetcode: "excel-sheet-column-number" },
      { id: "d6-w5", kind: "warmup", title: "LeetCode 118 Pascal's Triangle (binomials by recurrence)", leetcode: "pascals-triangle" },
      { id: "d6-w6", kind: "warmup", title: "LeetCode 1037 Valid Boomerang (cross product / collinearity)", leetcode: "valid-boomerang" },
      { id: "d6-w7", kind: "warmup", title: "LeetCode 812 Largest Triangle Area (shoelace)", leetcode: "largest-triangle-area" },
      { id: "d6-s1", kind: "solve", title: "Modulo (set of remainders)", kattis: "modulo" },
      { id: "d6-s2", kind: "solve", title: "Prime Sieve (bytearray sieve, speed matters)", kattis: "primesieve" },
      { id: "d6-s3", kind: "solve", title: "Das Blinkenlights (lcm)", kattis: "dasblinkenlights" },
      { id: "d6-s4", kind: "solve", title: "Candy Division (divisors)", kattis: "candydivision" },
      { id: "d6-s5", kind: "solve", title: "Pseudoprime Numbers (modpow, primality)", kattis: "pseudoprime" },
      { id: "d6-s6", kind: "solve", title: "Polygon Area (shoelace formula, orientation)", kattis: "polygonarea" },
    ],
  },
  {
    id: "m-mock",
    theme: "Mock contest and reference document",
    why: "Run one past set under contest conditions to practise the thing you cannot learn from problems: deciding what to work on next. Then print the reference document.",
    tasks: [
      { id: "d6-mock", important: true, kind: "do", title: "Mock contest: UKIEPC 2024 problem set, 3 hours, timer on, printed notes only, no internet except the judge", detail: "Problem sets and solutions for every past year are linked from the Past Contests section. The 2024 set is mirrored in the Codeforces Gym and the problems are on Kattis under the source 'UK and Ireland Programming Contest (UKIEPC) 2024'. Read all problems in the first 15 minutes, rank them, start with the easiest. Afterwards read the solution slides for everything you did not solve.", url: "https://ukiepc.info/2024/" },
      { id: "d6-trd", important: true, kind: "do", title: "Finalise and print the Team Reference Document (≤25 A4 pages): template, BFS/Dijkstra/DSU/sieve/DP snippets, Python gotchas", detail: "The Cheat Sheet tab has a print button. Add anything you looked up more than once this week." },
      { id: "d6-rest", kind: "do", title: "The night before: stop by 20:00. Sleep matters more than one more problem" },
    ],
  },
];

export const topics = ["warmup / io", "sorting", "hashing", "binary search", "greedy", "graphs", "shortest paths", "dp", "maths", "strings", "simulation", "geometry", "other"];



export interface Snippet {
  title: string;
  code: string;
}

export const snippets: Snippet[] = [
  {
    title: "Template (fast I/O, PyPy-friendly)",
    code: `import sys
from collections import deque, defaultdict, Counter
import heapq, bisect, math

def main():
    data = sys.stdin.buffer.read().split()
    idx = 0
    def nxt():
        nonlocal idx
        idx += 1
        return data[idx - 1]
    n = int(nxt())
    arr = [int(nxt()) for _ in range(n)]
    out = []
    # ...
    sys.stdout.write("\\n".join(map(str, out)) + "\\n")

main()
# Line-based input instead: for line in sys.stdin: ...
# Strings from buffer are bytes: nxt().decode()`,
  },
  {
    title: "Binary search (first true) and bisect",
    code: `def first_true(lo, hi, ok):      # ok monotone: F..F T..T, returns first T in [lo, hi]
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid): hi = mid
        else: lo = mid + 1
    return lo

import bisect
i = bisect.bisect_left(a, x)    # first index with a[i] >= x
j = bisect.bisect_right(a, x)   # first index with a[j] > x`,
  },
  {
    title: "BFS on a grid",
    code: `from collections import deque
dirs = [(1,0),(-1,0),(0,1),(0,-1)]
dist = [[-1]*W for _ in range(H)]
dq = deque([(sr, sc)]); dist[sr][sc] = 0
while dq:
    r, c = dq.popleft()
    for dr, dc in dirs:
        nr, nc = r+dr, c+dc
        if 0 <= nr < H and 0 <= nc < W and grid[nr][nc] != '#' and dist[nr][nc] == -1:
            dist[nr][nc] = dist[r][c] + 1
            dq.append((nr, nc))`,
  },
  {
    title: "Iterative DFS / components",
    code: `seen = [False]*n
comp = 0
for s in range(n):
    if seen[s]: continue
    comp += 1
    stack = [s]; seen[s] = True
    while stack:
        u = stack.pop()
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True
                stack.append(v)`,
  },
  {
    title: "Dijkstra",
    code: `import heapq
INF = float('inf')
dist = [INF]*n; dist[s] = 0
pq = [(0, s)]
while pq:
    d, u = heapq.heappop(pq)
    if d > dist[u]: continue           # stale entry
    for v, w in adj[u]:
        nd = d + w
        if nd < dist[v]:
            dist[v] = nd
            heapq.heappush(pq, (nd, v))`,
  },
  {
    title: "Topological sort (Kahn)",
    code: `from collections import deque
indeg = [0]*n
for u in range(n):
    for v in adj[u]: indeg[v] += 1
dq = deque(i for i in range(n) if indeg[i] == 0)
order = []
while dq:
    u = dq.popleft(); order.append(u)
    for v in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0: dq.append(v)
# len(order) < n  ->  cycle`,
  },
  {
    title: "Union-Find (DSU) and Kruskal",
    code: `parent = list(range(n)); size = [1]*n
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x
def union(a, b):
    a, b = find(a), find(b)
    if a == b: return False
    if size[a] < size[b]: a, b = b, a
    parent[b] = a; size[a] += size[b]
    return True

edges.sort()                       # (w, u, v)
total = sum(w for w, u, v in edges if union(u, v))`,
  },
  {
    title: "DP classics",
    code: `# 0/1 knapsack: best[c] = max value with capacity c
best = [0]*(C+1)
for w, v in items:
    for c in range(C, w-1, -1):
        best[c] = max(best[c], best[c-w] + v)

# coin change, number of ways (order does not matter)
ways = [0]*(T+1); ways[0] = 1
for coin in coins:
    for t in range(coin, T+1):
        ways[t] += ways[t-coin]

# LIS in n log n
import bisect
tails = []
for x in a:
    i = bisect.bisect_left(tails, x)   # bisect_right for non-decreasing
    if i == len(tails): tails.append(x)
    else: tails[i] = x
# len(tails) is the LIS length`,
  },
  {
    title: "Number theory",
    code: `import math
g = math.gcd(a, b); l = a*b//g
pow(a, b, m)                  # a^b mod m
inv = pow(a, m-2, m)          # inverse when m is prime

def sieve(n):
    is_p = bytearray([1])*(n+1); is_p[0] = is_p[1] = 0
    for i in range(2, int(n**0.5)+1):
        if is_p[i]: is_p[i*i::i] = bytearray(len(is_p[i*i::i]))
    return is_p

def is_prime(n):              # deterministic Miller-Rabin for n < 3.3e24
    if n < 2: return False
    for p in [2,3,5,7,11,13,17,19,23,29,31,37]:
        if n % p == 0: return n == p
    d, s = n-1, 0
    while d % 2 == 0: d //= 2; s += 1
    for a in [2,3,5,7,11,13,17,19,23,29,31,37]:
        x = pow(a, d, n)
        if x in (1, n-1): continue
        for _ in range(s-1):
            x = x*x % n
            if x == n-1: break
        else: return False
    return True

# nCr mod p
MOD = 10**9+7
fact = [1]*(N+1)
for i in range(1, N+1): fact[i] = fact[i-1]*i % MOD
def nCr(n, r):
    if r < 0 or r > n: return 0
    return fact[n]*pow(fact[r], MOD-2, MOD)*pow(fact[n-r], MOD-2, MOD) % MOD`,
  },
  {
    title: "Geometry basics",
    code: `def cross(o, a, b):            # >0 counter-clockwise, <0 clockwise, 0 collinear
    return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])

def polygon_area2(pts):        # twice the signed area (shoelace)
    s = 0
    for i in range(len(pts)):
        x1, y1 = pts[i]; x2, y2 = pts[(i+1) % len(pts)]
        s += x1*y2 - x2*y1
    return s                   # abs(s)/2 is the area; sign gives orientation`,
  },
  {
    title: "Python gotchas on Kattis (PyPy 3.9)",
    code: `# - print() in a loop is slow: collect into a list and write once.
# - input() is slow: use sys.stdin.buffer.read().split() or sys.stdin.readline.
# - Recursion: PyPy recursion is slow and may overflow; use iterative DFS. If you must:
#     sys.setrecursionlimit(1 << 25)   (and still risky)
# - Lists of lists: [[0]*W for _ in range(H)], never [[0]*W]*H.
# - float('inf') comparisons work; prefer ints when possible.
# - Sorting tuples sorts by first element then second; use key= for anything else.
# - Floating output: print(f"{x:.6f}"). Check if the problem allows a tolerance.
# - Bytes vs str: data from buffer are bytes; decode() if you need the string.
# - No match statement, no int.bit_count(), no zip(strict=) in 3.9.
# - If PyPy times out on heavy loops, C++ is also available; keep a C++ template too.`,
  },
];
