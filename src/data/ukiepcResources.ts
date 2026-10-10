// Summaries of the tutorial pages linked from the plan. Filled from reading each page.
export interface ResourceNote {
  title: string;
  url: string;
  topic: string;
  keyIdeas: string[];
  pitfalls: string[];
  snippet: string;
}

export interface ResourceGroup {
  label: string;
  topics: string[];
}

export const resourceGroups: ResourceGroup[] = [
  { label: "Rules and I/O", topics: ["rules", "io"] },
  { label: "Complexity, data structures, sorting", topics: ["complexity", "data structures", "sorting"] },
  { label: "Searching and greedy", topics: ["binary search", "prefix sums", "two pointers", "greedy"] },
  { label: "Graphs", topics: ["graph traversal", "flood fill", "bfs", "dsu", "shortest paths", "toposort", "mst"] },
  { label: "Dynamic programming", topics: ["dp", "knapsack", "lis"] },
  { label: "Maths and geometry", topics: ["modular arithmetic", "primes", "geometry"] },
];

export const resourceNotes: ResourceNote[] = [
  {
    "title": "UKIEPC FAQs (contest rules)",
    "url": "https://ukiepc.info/faqs.php",
    "topic": "rules",
    "keyIdeas": [
      "Teams of up to three students, one computer per team; everyone must complete ICPC registration and be accepted by the site host.",
      "Usually 8-12 problems in English; programs read stdin and write stdout unless the statement says otherwise.",
      "Languages listed for 2024: Python 3.9.18 on PyPy 7.3.15, Java 21, C++20, C17 (check the current year's list).",
      "Ranking: most problems solved, then lowest total time; each solved problem costs minutes to first accept plus 20 per wrong submission.",
      "Unsolved problems add no penalty, so a late wrong guess on an unsolved problem costs nothing.",
      "Allowed: printed materials incl. a Team Reference Document of at most 25 A4 pages, pens, paper; no phones, tablets or electronic notes.",
      "Banned: web, email, chat, other interpreters, and all AI assistants or Copilot-style plugins; plain autocomplete is fine.",
      "Clarification requests go through the judge system; real ambiguities are answered to all teams at all sites."
    ],
    "pitfalls": [
      "Opening the problem set or doing anything beyond logging in before the start.",
      "Talking to anyone outside your team and the organisers.",
      "Treating wrong submissions as free: each adds 20 minutes once the problem is eventually solved.",
      "Printing a reference document longer than 25 pages or bringing notes on a device."
    ],
    "snippet": ""
  },
  {
    "title": "USACO Guide: Input and Output",
    "url": "https://usaco.guide/general/io",
    "topic": "io",
    "keyIdeas": [
      "input() reads one line as a string; convert with int(), split(), or map().",
      "Read several numbers from one line with list(map(int, input().split())) or a, b, c = map(int, ...).",
      "sys.stdin.readline() is much faster than input() but keeps the trailing newline, so .strip() string input.",
      "print() appends a newline; use end=\"\" or sep=\"\" to change that; sys.stdout.write() takes only str and adds no newline.",
      "For file-based problems, reassign sys.stdin = open(...) and sys.stdout = open(...) and keep using input()/print().",
      "Build output lines with f-strings rather than string concatenation."
    ],
    "pitfalls": [
      "Trailing spaces or missing final newline can be judged wrong on strict judges.",
      "Forgetting strip() so 'abc\\n' != 'abc' in comparisons.",
      "Indexing a map object instead of wrapping it in list().",
      "Passing an int to sys.stdout.write()."
    ],
    "snippet": "import sys\ninput = sys.stdin.readline\nn = int(input())\na = list(map(int, input().split()))\ns = input().strip()\nprint(sum(a), s)"
  },
  {
    "title": "USACO Guide: Fast Input and Output",
    "url": "https://usaco.guide/general/fast-io",
    "topic": "io",
    "keyIdeas": [
      "Benchmark with N up to 10^6 lines: input()+print() took 18.9 s, sys.stdin.readline cut it to 2.9 s.",
      "Adding sys.stdout.write instead of print brought it to 2.4 s; file I/O performs about the same as stdin/stdout.",
      "Alias once at the top: input = sys.stdin.readline, write = sys.stdout.write.",
      "sys.stdout.write adds no newline, so append \"\\n\" yourself.",
      "Collect many output lines in a list and print(\"\\n\".join(lines)) once rather than printing in a loop.",
      "For the heaviest inputs read everything at once: data = sys.stdin.buffer.read().split()."
    ],
    "pitfalls": [
      "Rebinding input to readline then forgetting the trailing newline on string lines.",
      "Calling print() a million times inside a loop.",
      "Mixing input() and sys.stdin.read(): read-all consumes the whole stream."
    ],
    "snippet": "import sys\ndata = sys.stdin.buffer.read().split()\nn = int(data[0]); vals = list(map(int, data[1:1+n]))\nout = []\nfor v in vals:\n    out.append(str(v * 2))\nsys.stdout.write(\"\\n\".join(out) + \"\\n\")"
  },
  {
    "title": "GeeksforGeeks: Fast I/O in Python",
    "url": "https://www.geeksforgeeks.org/python/fast-i-o-for-competitive-programming-in-python/",
    "topic": "io",
    "keyIdeas": [
      "Read raw bytes from sys.stdin.buffer (or via io.BytesIO over os.read) instead of input() to avoid per-line Python overhead.",
      "Bytes convert to int directly with int(b'42'); strings need .decode().",
      "Use sys.stdin.buffer.read() to grab all input; .readline() on the buffer gives only one line.",
      "Write with sys.stdout.write(\" \".join(map(str, arr)) + \"\\n\") instead of print on each element.",
      "Measure with time.perf_counter() when unsure which approach is faster on the judge."
    ],
    "pitfalls": [
      "Forgetting to decode when a token is a string, giving b'abc' in output.",
      "Reading one line with buffer.readline() and assuming the whole input is consumed.",
      "Converting a list to str() directly, which prints brackets and commas."
    ],
    "snippet": "import sys, io, os\ninput = io.BytesIO(os.read(0, os.fstat(0).st_size)).readline\nn = int(input())\narr = list(map(int, input().split()))\nname = input().decode().strip()\nsys.stdout.write(\" \".join(map(str, arr)) + \"\\n\")"
  },
  {
    "title": "Kattis: Python 3 language page",
    "url": "https://open.kattis.com/languages/python3",
    "topic": "io",
    "keyIdeas": [
      "Kattis runs Python 3 under PyPy, not CPython; UKIEPC lists PyPy 7.3.15 with Python 3.9 syntax, so write 3.9-compatible code.",
      "Run command is simply pypy3 '{mainfile}' with no flags; you pick the main file when submitting.",
      "Accepted extensions are .py and .py3; there is no compile step.",
      "PyPy makes plain loops and ints fast, so pure-Python algorithms are viable; CPython-only C extensions (numpy) should not be assumed.",
      "Write for the syntax of the oldest listed version: no match statements or 3.10+ features if the contest says 3.9."
    ],
    "pitfalls": [
      "Assuming numpy or other third-party modules exist.",
      "Using Python 3.10+ syntax (match, int | None, zip strict) when the judge is 3.9.",
      "Deep recursion: raise sys.setrecursionlimit and prefer iterative DFS; PyPy recursion is slow and stack-limited."
    ],
    "snippet": "import sys\nsys.setrecursionlimit(1 << 25)\nfrom collections import deque, defaultdict, Counter\nimport heapq, bisect, math, itertools"
  },
  {
    "title": "USACO Guide: Time Complexity",
    "url": "https://usaco.guide/bronze/time-comp",
    "topic": "complexity",
    "keyIdeas": [
      "Big O counts worst-case operations as n grows, dropping constants and lower terms: 5n+17 is O(n).",
      "Nested loops multiply, sequential blocks add, simple statements and I/O are O(1).",
      "Rule of thumb ~10^8 simple operations per second compiled; PyPy is maybe 3-10x slower, CPython far slower.",
      "Feasible sizes: n<=10 O(n!); n<=20 O(2^n n); n<=400 O(n^3); n<=7500 O(n^2); n<=5e5 O(n log n); n<=5e6 O(n); n up to 1e18 O(log n).",
      "Sorting is O(n log n); binary search, heap and sorted-set operations are O(log n); all subsets O(2^n); permutations O(n!).",
      "Constant factors matter near the limit: iterating unordered triples instead of ordered is about 6x faster.",
      "Small bounds like n<=100 do not reveal the intended complexity."
    ],
    "pitfalls": [
      "Treating a dependent inner loop as O(n) when the worst case is still O(n^2).",
      "Hidden O(n) inside a loop: list.insert, pop(0), in on a list, string concatenation.",
      "Ignoring Python's constant factor when choosing between O(n log n) and O(n) ideas."
    ],
    "snippet": ""
  },
  {
    "title": "USACO Guide: Introduction to Data Structures",
    "url": "https://usaco.guide/bronze/intro-ds",
    "topic": "data structures",
    "keyIdeas": [
      "Python lists are dynamic arrays: append and pop() at the end are O(1); pop(i), insert(i, x) and remove are O(n).",
      "Preallocate with [0] * n; a 2D grid needs [[0] * m for _ in range(n)], never [[0]*m]*n.",
      "Tuples are immutable and compare lexicographically, so (5, 'a') < (6, 'a') works for points and pairs.",
      "List comprehensions parse input and build filtered lists compactly: [int(x) for x in input().split()].",
      "Iterate with for x in arr, or for i in range(len(arr)) when the index is needed; enumerate gives both.",
      "Memory limits (often 256 MB) include interpreter overhead and recursion stack."
    ],
    "pitfalls": [
      "Removing from the middle of a list repeatedly inside a loop.",
      "Aliasing rows with [[0]*m]*n so one write changes every row.",
      "Using a list for membership tests when a set or dict gives O(1)."
    ],
    "snippet": "from collections import deque\nq = deque([start]); seen = {start}\nwhile q:\n    u = q.popleft()\n    for v in adj[u]:\n        if v not in seen:\n            seen.add(v); q.append(v)"
  },
  {
    "title": "collections: Counter, defaultdict, deque (Python 3.9)",
    "url": "https://docs.python.org/3.9/library/collections.html",
    "topic": "data structures",
    "keyIdeas": [
      "Counter(iterable) counts hashables; missing key returns 0, not KeyError; most_common(n) gives top n (value,count) pairs.",
      "Counter supports update/subtract (add/subtract counts) and multiset ops +, - (drops <=0), & (min), | (max).",
      "defaultdict(factory): on a missing key calls factory() and inserts it; use int for counting, list/set for grouping.",
      "defaultdict reads insert keys, so use 'k in d' to test membership; d.get(k) does not use the factory.",
      "deque gives O(1) append/appendleft/pop/popleft; it is the BFS queue (list.pop(0) is O(N)).",
      "deque(maxlen=k) silently drops from the far end when full, handy for sliding windows.",
      "deque.rotate(n) rotates right (negative left); middle indexing is O(N), use a list for random access.",
      "extendleft reverses the order of what it adds."
    ],
    "pitfalls": [
      "Using list.pop(0) for BFS instead of deque.popleft(), giving O(N^2).",
      "Setting c[k]=0 does not delete the key; most_common and len still see it; use del c[k].",
      "Checking 'if d[k]' on a defaultdict creates the key and can change iteration or len.",
      "pop/popleft on an empty deque raises IndexError; check the deque first."
    ],
    "snippet": "from collections import Counter, defaultdict, deque\nc = Counter(a); top = c.most_common(1)[0]\ng = defaultdict(list)\nfor u, v in edges: g[u].append(v); g[v].append(u)\nq = deque([src]); dist = {src: 0}\nwhile q:\n    u = q.popleft()\n    for v in g[u]:\n        if v not in dist:\n            dist[v] = dist[u] + 1; q.append(v)"
  },
  {
    "title": "USACO Guide: Custom Sorting",
    "url": "https://usaco.guide/silver/sorting-custom",
    "topic": "sorting",
    "keyIdeas": [
      "Use key= with a lambda returning a comparable value: edges.sort(key=lambda e: e.width).",
      "Return a tuple from key for multiple criteria; tuples compare element by element.",
      "Descend on one key while ascending on another by negating a numeric field: key=lambda e: (-e.w, e.a).",
      "reverse=True reverses the whole ordering; sorted() returns a new list, .sort() is in place.",
      "A true comparator goes through functools.cmp_to_key and must return negative, zero or positive.",
      "Python's sort is stable, so sorting twice by secondary then primary key also works.",
      "Coordinate compression: sort distinct values, then map each value to its index with a dict or bisect."
    ],
    "pitfalls": [
      "Passing a comparator function directly to sort instead of wrapping with cmp_to_key.",
      "Comparators that violate transitivity or antisymmetry give garbage orders.",
      "Mixed types in a key (int vs str) raise TypeError.",
      "Overwriting values during compression and losing the originals."
    ],
    "snippet": "from functools import cmp_to_key\nitems.sort(key=lambda t: (-t[1], t[0]))  # score desc, name asc\nvals = sorted(set(a))\nrank = {v: i for i, v in enumerate(vals)}\ncomp = [rank[x] for x in a]\nedges.sort(key=cmp_to_key(lambda x, y: x.w - y.w))"
  },
  {
    "title": "Binary Search (USACO Guide Silver)",
    "url": "https://usaco.guide/silver/binary-search",
    "topic": "binary search",
    "keyIdeas": [
      "Binary search on the answer needs a monotonic predicate f(x): once true it stays true in one direction.",
      "first_true finds smallest x in [lo,hi] with f(x) true; returns hi+1 if none exists.",
      "last_true finds largest x with f(x) true; returns lo-1 if none exists.",
      "Each step halves the range, so only O(log N) calls to f; with O(N) checks total is O(N log N).",
      "Max Median (CF 1201C): sort, cost(x) = sum of max(0, x-a[i]) over upper half; last_true on cost(x) <= k.",
      "Sorted-array search is the same idea: test the middle, discard the half that cannot contain the target.",
      "Python ints never overflow, so lo+hi is safe, but the midpoint rounding rules still matter."
    ],
    "pitfalls": [
      "Infinite loop in last_true with mid=(lo+hi)//2 when lo=0, hi=1; use mid=(lo+hi+1)//2.",
      "Mixing up which side to cut when f(mid) is true (first_true: hi=mid; last_true: lo=mid).",
      "Forgetting the 'no valid x' sentinel return value and reading it as a real answer."
    ],
    "snippet": "def first_true(lo, hi, f):\n    hi += 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if f(mid): hi = mid\n        else: lo = mid + 1\n    return lo  # hi+1 if none\n\ndef last_true(lo, hi, f):\n    while lo < hi:\n        mid = (lo + hi + 1) // 2\n        if f(mid): lo = mid\n        else: hi = mid - 1\n    return lo"
  },
  {
    "title": "Binary Search (cp-algorithms)",
    "url": "https://cp-algorithms.com/num_methods/binary_search.html",
    "topic": "binary search",
    "keyIdeas": [
      "Invariant template: l=-1, r=n, keep a[l] <= k < a[r], loop while r-l > 1, never read the sentinels.",
      "If k < a[m] set r=m else l=m; at the end r is upper_bound, l is last index with a[l] <= k.",
      "Same loop finds the 0->1 transition of any monotone boolean predicate: keep f(l)=0, f(r)=1.",
      "Search on the answer: if 'is answer >= lam' is monotone and checkable, binary search over lam.",
      "Continuous search: bisect a real interval until width < delta, O(log((R-L)/delta)) steps; often just loop 100 times.",
      "Powers-of-two variant (binary lifting) walks a pointer with decreasing jumps; used for Fenwick k-th element.",
      "Parallel binary search answers many queries at once, sorting midpoints each round, O((N+K) log N log K).",
      "In Python use bisect.bisect_left (lower_bound) and bisect.bisect_right (upper_bound) on sorted lists."
    ],
    "pitfalls": [
      "A lower_bound index does not mean the value exists; check i < n and a[i] == k.",
      "Choosing bisect_left vs bisect_right wrongly when duplicates matter.",
      "Reading a[l] or a[r] when they are the -1 / n sentinels."
    ],
    "snippet": "from bisect import bisect_left, bisect_right\na = sorted(xs)\ni = bisect_left(a, k)        # first index with a[i] >= k\nj = bisect_right(a, k)       # first index with a[j] > k\ncount_equal = j - i\npresent = i < len(a) and a[i] == k\n# real-valued answer:\nlo, hi = 0.0, 1e9\nfor _ in range(100):\n    mid = (lo + hi) / 2\n    lo, hi = (mid, hi) if ok(mid) else (lo, mid)"
  },
  {
    "title": "Prefix Sums (USACO Guide Silver)",
    "url": "https://usaco.guide/silver/prefix-sums",
    "topic": "prefix sums",
    "keyIdeas": [
      "Build p[0]=0, p[k]=p[k-1]+a[k] in O(N); then any range sum is O(1).",
      "Sum of 1-indexed inclusive range [L,R] is p[R]-p[L-1]; with 0-indexed a use p[R+1]-p[L].",
      "N and Q up to 1e5 makes naive O(NQ) summing too slow; prefix sums give O(N+Q).",
      "Example: a=[1,6,4,2,5,3] gives p=[0,1,7,11,13,18,21]; sum(2..5)=18-1=17.",
      "Works for any invertible operation: XOR (use ^ and p[R]^p[L-1]), modular sums, counts of a property.",
      "Python: p = list(accumulate(a, initial=0)) from itertools builds it in one line.",
      "Count 'number of elements satisfying X in range' by prefix-summing a 0/1 indicator array."
    ],
    "pitfalls": [
      "Forgetting the leading 0 or subtracting p[L] instead of p[L-1].",
      "Mixing 0- and 1-indexing between the array and the prefix array.",
      "Rebuilding the prefix array after each query instead of once."
    ],
    "snippet": "from itertools import accumulate\np = list(accumulate(a, initial=0))   # len(a)+1\ndef rng(l, r):                      # 0-indexed inclusive\n    return p[r + 1] - p[l]"
  },
  {
    "title": "Two Pointers (USACO Guide Silver)",
    "url": "https://usaco.guide/silver/two-pointers",
    "topic": "two pointers",
    "keyIdeas": [
      "Opposite ends: on a sorted array set l=0, r=n-1; sum too small -> l+=1, too big -> r-=1.",
      "Works because sorting makes moves monotone: advancing l never decreases the sum, retreating r never increases it.",
      "Sliding window: both pointers move right; for each l extend r while the window stays valid.",
      "Window monotonicity: when l advances the sum only drops, so r never needs to move back.",
      "Each pointer moves at most N times, so the scan is O(N); O(N log N) overall if you sort first.",
      "Keep (value, index) pairs when sorting if the answer needs original positions.",
      "Pairs well with binary search and prefix sums (Cellular Network, Cow Checkups)."
    ],
    "pitfalls": [
      "Applying opposite-ends logic to an unsorted array.",
      "Forgetting to subtract a[l] from the window sum when l advances.",
      "Letting r run past the end: guard with r+1 < n before extending."
    ],
    "snippet": "# longest subarray with sum <= k, all a[i] >= 0\nr = s = best = 0\nfor l in range(n):\n    while r < n and s + a[r] <= k:\n        s += a[r]; r += 1\n    best = max(best, r - l)\n    if r == l: r += 1      # empty window, skip\n    else: s -= a[l]"
  },
  {
    "title": "Greedy with Sorting (USACO Guide Silver)",
    "url": "https://usaco.guide/silver/greedy-sorting",
    "topic": "greedy",
    "keyIdeas": [
      "Greedy takes the locally best choice at each step and never revisits it; a value function defines 'best'.",
      "Sorting puts candidates in the order the greedy rule wants, then a single O(N) scan takes each item that fits.",
      "Interval scheduling (Movie Festival): sort by END time, take an event if start >= last chosen end.",
      "Earliest-ending event leaves a superset of future options, which is the exchange argument proving it optimal.",
      "Total cost is O(N log N) for the sort plus O(N) for the scan.",
      "Verify greedy with an exchange argument, or brute-force small random cases and compare outputs.",
      "Python: events.sort(key=lambda e: e[1]) or sort tuples (end, start) directly."
    ],
    "pitfalls": [
      "Sorting intervals by start time instead of end time: a long early event blocks many short ones.",
      "Assuming greedy works everywhere: coins {1,3,4} target 6 takes 4+1+1 but 3+3 is optimal.",
      "Greedy by value or value/weight fails 0/1 knapsack; that needs DP."
    ],
    "snippet": "events.sort(key=lambda e: e[1])  # (start, end)\nlast_end, cnt = -1, 0\nfor s, e in events:\n    if s >= last_end:\n        cnt += 1; last_end = e"
  },
  {
    "title": "Graph Traversal (DFS/BFS)",
    "url": "https://usaco.guide/silver/graph-traversal",
    "topic": "graph traversal",
    "keyIdeas": [
      "DFS and BFS both visit every reachable node once in O(N+M); use a visited list so no node is processed twice.",
      "Build adjacency lists as adj=[[] for _ in range(n)]; append both directions for undirected edges; convert 1-indexed input to 0-indexed.",
      "Count connected components by looping over all nodes and launching a traversal from each unvisited one; launches = components.",
      "Connecting C components needs C-1 edges: link one representative node from each component in a chain.",
      "Bipartite check: colour start node 0, neighbours get the opposite colour; an edge joining equal colours means not bipartite.",
      "Use collections.deque with append/popleft for BFS; queue.Queue is lock-based, slow, and get() blocks forever on empty.",
      "Recursive DFS dies on ~1e5-node line graphs; sys.setrecursionlimit helps but still TLEs on PyPy, so use an explicit stack."
    ],
    "pitfalls": [
      "Recursive DFS on PyPy: RecursionError or TLE; always write iterative DFS/BFS with a list stack or deque.",
      "Forgetting to add the reverse edge for undirected graphs.",
      "Marking visited on pop instead of push, which enqueues nodes many times."
    ],
    "snippet": "def components(n, adj):\n    seen = [False]*n; comps = 0\n    for s in range(n):\n        if seen[s]: continue\n        comps += 1; seen[s] = True; stack = [s]\n        while stack:\n            v = stack.pop()\n            for w in adj[v]:\n                if not seen[w]: seen[w] = True; stack.append(w)\n    return comps"
  },
  {
    "title": "Flood Fill",
    "url": "https://usaco.guide/silver/flood-fill",
    "topic": "flood fill",
    "keyIdeas": [
      "A grid is an implicit graph: each cell's neighbours are the 4 cardinal cells (8 if diagonals allowed).",
      "Flood fill is DFS/BFS on the grid; it labels the component containing a start cell and returns its size.",
      "Push a neighbour only if it is in bounds, unvisited, and matches the target value; mark visited when pushing.",
      "Count regions (CSES Counting Rooms) by starting a fill from every unvisited matching cell and incrementing a counter.",
      "Padding the grid with a border of visited cells removes bounds checks, a constant-factor win in Python.",
      "Total work is O(rows*cols); recursive fills can exceed memory on 4000x4000 grids, so use an iterative stack."
    ],
    "pitfalls": [
      "Missing bounds check or visited check leads to IndexError or infinite loops.",
      "Python negative indices wrap around silently: grid[-1] is valid, so check r>=0 explicitly.",
      "Using recursion on PyPy for large grids causes RecursionError/TLE."
    ],
    "snippet": "DIRS = ((1,0),(-1,0),(0,1),(0,-1))\ndef fill(g, r0, c0, seen):\n    R, C = len(g), len(g[0]); ch = g[r0][c0]\n    seen[r0][c0] = True; st = [(r0,c0)]; size = 0\n    while st:\n        r, c = st.pop(); size += 1\n        for dr, dc in DIRS:\n            nr, nc = r+dr, c+dc\n            if 0<=nr<R and 0<=nc<C and not seen[nr][nc] and g[nr][nc]==ch:\n                seen[nr][nc] = True; st.append((nr,nc))\n    return size"
  },
  {
    "title": "Breadth-First Search",
    "url": "https://cp-algorithms.com/graph/breadth-first-search.html",
    "topic": "bfs",
    "keyIdeas": [
      "BFS explores in layers; in unweighted graphs the first time a node is reached gives its shortest-edge-count distance.",
      "Keep dist (init -1) and parent arrays; set dist[w]=dist[v]+1 and parent[w]=v when first reaching w; O(N+M).",
      "Reconstruct a path by following parents from target back to source, then reversing; dist==-1 means unreachable.",
      "Minimum-moves puzzles: encode each state as a node and each move as an edge, then BFS from the start state.",
      "0-1 BFS: with weights 0/1, use a deque, appendleft for weight-0 edges and append for weight-1, comparing distances not visited flags.",
      "Edges on some shortest s-t path satisfy ds[u]+1+dt[v]==ds[t]; run BFS from both ends.",
      "Shortest cycle through a vertex in a directed graph: BFS from it and record when an edge returns to the source.",
      "Shortest even-length walk: BFS on states (vertex, parity) from (s,0) to (t,0)."
    ],
    "pitfalls": [
      "Marking visited on pop instead of push lets a node be queued many times.",
      "Using list.pop(0) for a queue is O(N); use deque.popleft.",
      "Reconstructing a path without first checking the target was reached."
    ],
    "snippet": "from collections import deque\ndef bfs(adj, s):\n    dist = [-1]*len(adj); par = [-1]*len(adj)\n    dist[s] = 0; q = deque([s])\n    while q:\n        v = q.popleft()\n        for w in adj[v]:\n            if dist[w] == -1:\n                dist[w] = dist[v]+1; par[w] = v; q.append(w)\n    return dist, par"
  },
  {
    "title": "Disjoint Set Union",
    "url": "https://usaco.guide/gold/dsu",
    "topic": "dsu",
    "keyIdeas": [
      "DSU maintains components under edge additions: find(x) gives the representative, union(a,b) merges, connected(a,b) compares roots.",
      "Store parent (init parent[i]=i) and size (init 1) lists; path compression points every visited node directly at the root.",
      "Union by size attaches the smaller tree under the larger; with compression each op is amortised O(alpha(N)), effectively constant.",
      "Q connectivity queries cost O(Q alpha(N)) versus O(NQ) for re-running flood fill each time.",
      "Used for Kruskal's MST, offline connectivity (process edges sorted by weight/time), and 'minimum max-edge' problems like Wormhole Sort.",
      "Edge deletions are not supported directly; reverse the operations offline and treat deletions as additions."
    ],
    "pitfalls": [
      "Recursive find on PyPy can blow the stack on long chains; write it iteratively.",
      "Forgetting to compare roots (find(a)==find(b)) and comparing raw indices instead.",
      "Size array only valid at roots; always read size[find(x)]."
    ],
    "snippet": "par = list(range(n)); sz = [1]*n\ndef find(x):\n    while par[x] != x:\n        par[x] = par[par[x]]; x = par[x]\n    return x\ndef union(a, b):\n    a, b = find(a), find(b)\n    if a == b: return False\n    if sz[a] < sz[b]: a, b = b, a\n    par[b] = a; sz[a] += sz[b]; return True"
  },
  {
    "title": "Shortest Paths (Non-Negative Weights)",
    "url": "https://usaco.guide/gold/shortest-paths",
    "topic": "shortest paths",
    "keyIdeas": [
      "Dijkstra: single-source, non-negative weights only; heap version O((N+M) log N), array version O(N^2) for dense graphs.",
      "Use heapq with (dist, node) tuples; on pop, skip if d > dist[node] (stale entry) so each adjacency list is scanned once.",
      "Floyd-Warshall: all-pairs, handles negative edges, O(N^3), fine for N<=500 in C++ but risky in Python; loop order must be k, i, j.",
      "Bellman-Ford: O(NM), handles negative edges and detects negative cycles when an N-th round still relaxes.",
      "Use a large int sentinel like 1<<60 rather than float('inf') for speed and to keep integer arithmetic.",
      "Lexicographic/path output: store parent on each successful relaxation and backtrack from the target.",
      "Multiple sources: push all of them with distance 0 into the heap at the start."
    ],
    "pitfalls": [
      "Omitting the stale-entry continue turns Dijkstra into Theta(N^2 log N) and TLEs.",
      "Running Dijkstra with negative edges gives wrong answers silently.",
      "Wrong Floyd-Warshall loop order (i,j,k) produces incorrect distances."
    ],
    "snippet": "import heapq\ndef dijkstra(adj, s):\n    INF = 1<<60; dist = [INF]*len(adj); dist[s] = 0\n    pq = [(0, s)]\n    while pq:\n        d, v = heapq.heappop(pq)\n        if d > dist[v]: continue\n        for w, c in adj[v]:\n            if d + c < dist[w]:\n                dist[w] = d + c; heapq.heappush(pq, (d + c, w))\n    return dist"
  },
  {
    "title": "Dijkstra (cp-algorithms)",
    "url": "https://cp-algorithms.com/graph/dijkstra.html",
    "topic": "shortest paths",
    "keyIdeas": [
      "Maintain d[] (0 at source, INF elsewhere) and a marked set; repeatedly pick the unmarked vertex with smallest d and relax its edges.",
      "Relaxation: d[to] = min(d[to], d[v] + w); record p[to] = v whenever it improves.",
      "Correctness: once a vertex is marked its distance is final, which relies on all weights being >= 0.",
      "Dense O(N^2 + M): scan the array for the minimum each iteration; best when M is near N^2.",
      "Sparse O(M log N): replace the scan with a heap; in Python use heapq with lazy deletion of stale entries.",
      "Stop early if the selected vertex has d == INF; everything left is unreachable.",
      "Restore the path by following p[] from t back to s and reversing."
    ],
    "pitfalls": [
      "Negative edges break the proof; use Bellman-Ford or SPFA instead.",
      "Pushing (node, dist) instead of (dist, node) into heapq orders by node id.",
      "Using the O(N^2) version on sparse graphs with N=1e5 is far too slow."
    ],
    "snippet": ""
  },
  {
    "title": "Topological Sort",
    "url": "https://usaco.guide/gold/toposort",
    "topic": "toposort",
    "keyIdeas": [
      "A topological order of a DAG lists vertices so every edge u->v has u before v; only DAGs have one.",
      "Kahn's algorithm: compute in-degrees, queue all zero-in-degree nodes, pop, append to order, decrement neighbours, enqueue those hitting zero; O(N+M).",
      "Cycle detection: if the Kahn order has fewer than N nodes, the graph has a cycle.",
      "Lexicographically smallest order: swap the deque for a heapq min-heap.",
      "DFS variant: iterative post-order then reverse; an on_stack marker detects back edges and lets you reconstruct the cycle.",
      "DP on DAGs (longest path, path counting): process nodes in topological order so all predecessors are finished first."
    ],
    "pitfalls": [
      "Recursive DFS toposort on PyPy hits recursion limits; prefer Kahn's.",
      "Self-loops are a cycle; handle them before running cycle reconstruction code.",
      "Computing dp[v] before all its predecessors have been finalised."
    ],
    "snippet": "from collections import deque\ndef kahn(n, adj):\n    indeg = [0]*n\n    for v in range(n):\n        for w in adj[v]: indeg[w] += 1\n    q = deque(v for v in range(n) if indeg[v] == 0); order = []\n    while q:\n        v = q.popleft(); order.append(v)\n        for w in adj[v]:\n            indeg[w] -= 1\n            if indeg[w] == 0: q.append(w)\n    return order  # len(order) < n means a cycle"
  },
  {
    "title": "Minimum Spanning Trees",
    "url": "https://usaco.guide/gold/mst",
    "topic": "mst",
    "keyIdeas": [
      "A spanning tree uses N-1 edges touching every vertex; an MST minimises the total weight.",
      "Kruskal: sort edges by weight, add each edge whose endpoints are in different DSU components; O(M log M).",
      "Stop Kruskal after N-1 accepted edges; fewer than N-1 at the end means the graph is disconnected (impossible case).",
      "Prim with heapq: like Dijkstra but key is the edge weight to the tree, not distance from source; O(M log M).",
      "Prim with linear scan is O(N^2), best for dense graphs where M is about N^2.",
      "Maximum spanning tree: sort descending (or negate weights); the same algorithms apply.",
      "Many problems reduce to MST: minimise the maximum edge on a path, connect all nodes cheaply."
    ],
    "pitfalls": [
      "The page's Python Kruskal TLEs on some tests; sort tuples of ints once and use an iterative DSU with path compression.",
      "Forgetting that an MST of a disconnected graph does not exist; check the edge count.",
      "Building the heap with (node, weight) instead of (weight, node) in Prim."
    ],
    "snippet": "def kruskal(n, edges):  # edges: (w, a, b)\n    edges.sort(); total = 0; used = 0\n    for w, a, b in edges:\n        if union(a, b):\n            total += w; used += 1\n            if used == n - 1: break\n    return total if used == n - 1 else None"
  },
  {
    "title": "Introduction to DP",
    "url": "https://usaco.guide/gold/intro-dp",
    "topic": "dp",
    "keyIdeas": [
      "DP = brute-force recursion plus caching: define a state, compute each state once, reuse it.",
      "Always write down three things: state (what dp[i] means), transition, base case.",
      "Pull DP: dp[i] computed from earlier states; Push DP: from state i update later states.",
      "Iterate states in an order where every dependency is final before use (usually increasing i).",
      "Initialise dp to float('inf') (or -inf for max), set base case explicitly, e.g. dp[0] = 0.",
      "Frog example: dp[i] = min(dp[i-1]+|h[i]-h[i-1]|, dp[i-2]+|h[i]-h[i-2]|), O(N).",
      "Write a slower correct solution first; use it as a brute-force checker."
    ],
    "pitfalls": [
      "Mixing 0-indexed and 1-indexed arrays in the same solution.",
      "Forgetting to cap/initialise unreachable states (INF), so they look like valid answers.",
      "Recursive memoisation in PyPy is slow and can hit recursion limits; write iterative loops."
    ],
    "snippet": "INF = float('inf')\ndp = [INF] * n\ndp[0] = 0\nfor i in range(1, n):\n    dp[i] = dp[i-1] + abs(h[i] - h[i-1])\n    if i >= 2:\n        dp[i] = min(dp[i], dp[i-2] + abs(h[i] - h[i-2]))\nprint(dp[n-1])"
  },
  {
    "title": "Knapsack DP",
    "url": "https://usaco.guide/gold/knapsack",
    "topic": "knapsack",
    "keyIdeas": [
      "State is the capacity/sum used so far; transition tries adding one item.",
      "0/1 knapsack (each item once): for each item, loop capacity DOWNWARDS so the item is not reused.",
      "Unbounded knapsack (unlimited copies): loop capacity UPWARDS so the item can be reused.",
      "Ordered counting (Dice Combinations): dp[x] = sum(dp[x-f] for faces f), dp[0] = 1.",
      "Unordered counting (Coin Combinations I): outer loop over coins, inner loop over sums, to avoid double counting.",
      "Min coins: dp[x] = min(dp[x-c]+1), dp[0]=0, INF for unreachable.",
      "Achievable sums / Money Sums: dp is a set or boolean list of reachable totals, or use a Python int bitset: bits |= bits << w.",
      "Contest problems disguise knapsack; look for 'choose subset with sum/weight constraint'."
    ],
    "pitfalls": [
      "Wrong loop direction: forward loop on 0/1 knapsack silently allows repeats.",
      "Swapping loop order in counting problems changes ordered vs unordered counts.",
      "Forgetting the modulus on every addition when counting mod 1e9+7."
    ],
    "snippet": "# 0/1 knapsack, max value, capacity W\ndp = [0] * (W + 1)\nfor w, v in items:\n    for c in range(W, w - 1, -1):   # downwards\n        if dp[c-w] + v > dp[c]:\n            dp[c] = dp[c-w] + v\n# unbounded: for c in range(w, W + 1)  (upwards)"
  },
  {
    "title": "Longest Increasing Subsequence",
    "url": "https://cp-algorithms.com/sequences/longest_increasing_subsequence.html",
    "topic": "lis",
    "keyIdeas": [
      "O(n^2): d[i] = 1 + max(d[j] for j<i with a[j]<a[i]); answer max(d).",
      "O(n log n): d[l] = smallest value that ends an increasing subsequence of length l; d stays sorted.",
      "For each x: pos = bisect_left(d, x); if pos == len(d) append, else d[pos] = x. Answer len(d).",
      "Strictly increasing uses bisect_left; non-decreasing uses bisect_right.",
      "To restore: record pos for each element, then scan backwards collecting pos == L-1, L-2, ... and reverse.",
      "Min number of non-increasing subsequences covering the array equals LIS length (Dilworth).",
      "Counting number of LIS needs the O(n^2) or Fenwick-tree version, not the bisect trick."
    ],
    "pitfalls": [
      "The final d list is NOT the actual subsequence, only its length.",
      "Using bisect_left for non-decreasing LIS breaks on duplicates.",
      "Longest decreasing: negate values or reverse the array, do not rewrite the logic."
    ],
    "snippet": "from bisect import bisect_left, bisect_right\ndef lis(a, strict=True):\n    d = []\n    bis = bisect_left if strict else bisect_right\n    for x in a:\n        p = bis(d, x)\n        if p == len(d): d.append(x)\n        else: d[p] = x\n    return len(d)"
  },
  {
    "title": "Modular Arithmetic",
    "url": "https://usaco.guide/gold/modular",
    "topic": "modular arithmetic",
    "keyIdeas": [
      "Reduce after every + - *: (a*b) % M == ((a%M)*(b%M)) % M; Python ints never overflow but stay small for speed.",
      "Python's % always returns a non-negative result for positive M, so (a-b) % M is already safe.",
      "Fast power: pow(a, b, M) is built in, O(log b).",
      "Modular inverse for prime M: pow(a, M-2, M) (Fermat); Python 3.8+ also allows pow(a, -1, M).",
      "Division = multiply by inverse; only valid when gcd(a, M) == 1 (always true for prime M and a % M != 0).",
      "nCr mod p: precompute fact[i] and inv_fact[i] (inv_fact[n] = pow(fact[n], p-2, p), then go downwards).",
      "Linear inverses: inv[i] = (M - (M//i) * inv[M % i] % M) % M for i in 2..n, with inv[1] = 1.",
      "Inverses cost O(log M); precompute them rather than calling pow inside hot loops."
    ],
    "pitfalls": [
      "Dividing by a value that is 0 mod M (e.g. a multiple of 1e9+7).",
      "Using Fermat inverse with a non-prime modulus such as 1e9+6 or 998244352.",
      "Forgetting the final % M after a subtraction or after summing many terms."
    ],
    "snippet": "M = 10**9 + 7\nN = 2 * 10**5\nfact = [1] * (N + 1)\nfor i in range(1, N + 1): fact[i] = fact[i-1] * i % M\ninv = [1] * (N + 1)\ninv[N] = pow(fact[N], M - 2, M)\nfor i in range(N, 0, -1): inv[i-1] = inv[i] * i % M\ndef C(n, k):\n    return 0 if k < 0 or k > n else fact[n] * inv[k] % M * inv[n-k] % M"
  },
  {
    "title": "Sieve of Eratosthenes",
    "url": "https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html",
    "topic": "primes",
    "keyIdeas": [
      "Mark multiples of each prime i starting at i*i; outer loop only while i*i <= n.",
      "Complexity O(n log log n) time, O(n) memory; fine for n up to about 1e7 in PyPy with a bytearray.",
      "Use bytearray and slice assignment for speed: is_p[i*i::i] = bytes(len(range(i*i, n+1, i))).",
      "Mark 0 and 1 as not prime explicitly.",
      "Primes in a range [L, R] with large R: sieve primes up to sqrt(R), then mark their multiples inside [L, R] (segmented sieve).",
      "Odd-only sieve halves memory and work; segmented sieve in blocks of 1e4 to 1e5 is cache friendly.",
      "Smallest-prime-factor variant (store spf[x]) gives O(log x) factorisation of any x <= n.",
      "Linear sieve exists (O(n)) but the simple sieve is usually fast enough."
    ],
    "pitfalls": [
      "Starting marking from 2*i instead of i*i (correct but roughly twice as slow).",
      "Forgetting to handle 0 and 1, or the last segment running past n.",
      "Trial division per query instead of a sieve when there are many queries."
    ],
    "snippet": "def sieve(n):\n    is_p = bytearray([1]) * (n + 1)\n    is_p[0] = is_p[1] = 0\n    for i in range(2, int(n**0.5) + 1):\n        if is_p[i]:\n            is_p[i*i::i] = bytes(len(range(i*i, n + 1, i)))\n    return [i for i in range(n + 1) if is_p[i]]"
  },
  {
    "title": "Basic Geometry (vectors)",
    "url": "https://cp-algorithms.com/geometry/basic-geometry.html",
    "topic": "geometry",
    "keyIdeas": [
      "Represent points as tuples (x, y); vectors are differences of points, use integers whenever input is integer.",
      "Dot product ax*bx + ay*by = |a||b|cos(theta): 0 means perpendicular, >0 acute, <0 obtuse.",
      "Squared length a.a; compare squared distances to avoid sqrt and floating error.",
      "Projection of a onto b is (a.b)/|b|.",
      "2D cross product ax*by - ay*bx = signed parallelogram area; >0 means b is counter-clockwise from a.",
      "Orientation of three points A,B,C: cross(B-A, C-A); 0 means collinear, sign gives turn direction.",
      "Triangle area = abs(cross)/2; keep twice-area as an integer when coordinates are integers.",
      "Line intersection: t = cross(a2-a1, d2)/cross(d1, d2), point a1 + t*d1; cross(d1,d2) == 0 means parallel."
    ],
    "pitfalls": [
      "Using floats when integers suffice; Python ints are exact and never overflow.",
      "Comparing floats with ==; use an epsilon like 1e-9 when floats are unavoidable.",
      "Clamp the argument of math.acos to [-1, 1]; prefer math.atan2(cross, dot) for angles."
    ],
    "snippet": "def cross(o, a, b):\n    return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])\ndef dot(o, a, b):\n    return (a[0]-o[0])*(b[0]-o[0]) + (a[1]-o[1])*(b[1]-o[1])\n# cross > 0: counter-clockwise turn o->a->b; == 0: collinear"
  },
  {
    "title": "Area of a Simple Polygon",
    "url": "https://cp-algorithms.com/geometry/area-of-simple-polygon.html",
    "topic": "geometry",
    "keyIdeas": [
      "Shoelace formula: 2A = sum over edges (p,q) of (px*qy - qx*py), vertices in order, last wraps to first.",
      "Equivalent trapezoid form: 2A = sum (px - qx)*(py + qy).",
      "Works for any simple (non-self-intersecting) polygon, convex or not, in O(N).",
      "The signed sum is positive for counter-clockwise order, negative for clockwise; take abs for area.",
      "Sign of the sum tells you the orientation, useful before convex hull or point-in-polygon.",
      "With integer coordinates keep twice-area as an exact integer; divide by 2 only when printing.",
      "Same idea as summing signed triangle areas from any fixed point O; overlaps cancel."
    ],
    "pitfalls": [
      "Forgetting to wrap the last vertex back to the first.",
      "Dividing by 2 in integers (loses .5) or using floats when exact output is required.",
      "Applying it to a self-intersecting polygon, where the formula is meaningless."
    ],
    "snippet": "def twice_area(pts):\n    s = 0\n    n = len(pts)\n    for i in range(n):\n        x1, y1 = pts[i]\n        x2, y2 = pts[(i + 1) % n]\n        s += x1 * y2 - x2 * y1\n    return abs(s)   # area = s / 2; s > 0 before abs means CCW"
  }
];
