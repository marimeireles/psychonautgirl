// Anthropic interview practice problems, rebuilt from public candidate reports
// (hellointerview, PracHub, Blind, LeetCode discuss, 1point3acres, Glassdoor).
// Real interview content is confidential — these are format-faithful practice
// versions written in our own words, not the actual assessment text.
//
// OA problems follow CodeSignal's "Industry Coding Framework": one project,
// 4 levels that unlock as the previous level's tests pass, 90 minutes, /1000.
// Expected values live in interviewTests.ts, generated + verified by reference
// solutions (scratchpad gen_tests scripts).

import { generatedTests } from "./interviewTests";

export interface TestCase {
  name: string;
  call: string; // python expression evaluated against your code
  expected: string; // exact repr() of the expected value
  setup?: string; // optional python statements run before `call`
}

export interface Level {
  title: string;
  spec: string; // markdown
  tests: TestCase[];
}

export interface Problem {
  id: string;
  title: string;
  stage: "oa" | "screening" | "onsite";
  difficulty: "medium" | "hard";
  reported: boolean; // true = level specs grounded in candidate reports; false = reconstructed from the title
  timerMinutes?: number;
  starterCode: string;
  levels: Level[];
}

export const stageLabel: Record<Problem["stage"], string> = {
  oa: "Online assessment (CodeSignal ICA)",
  screening: "Technical screen (~1h, Colab)",
  onsite: "Onsite coding (~55 min)",
};

const t = (id: string, lvl: number): TestCase[] => generatedTests[id]?.[lvl] ?? [];

const QUERY_FORMAT = `Implement \`solution(queries)\`. Each query is a list of strings — an operation name
followed by its arguments. Return a list with one result string per query (\`""\` when the
operation has no output). Numbers arrive as strings and are returned as strings.`;

export const problems: Problem[] = [
  // ───────────────────────── OA: CodeSignal ICA style ─────────────────────────
  {
    id: "imdb",
    title: "In-memory Database with Backup",
    stage: "oa",
    difficulty: "hard",
    reported: true,
    timerMinutes: 90,
    starterCode: `def solution(queries):
    # queries: list[list[str]] -> list[str]
    results = []
    for q in queries:
        op = q[0]
        # TODO
        results.append("")
    return results
`,
    levels: [
      {
        title: "Level 1 — records, fields, values",
        spec: `${QUERY_FORMAT}

The database holds **records** (by key), each a set of **fields** with string values.

| operation | returns |
|---|---|
| \`SET key field value\` | \`""\` — creates or overwrites the field |
| \`GET key field\` | the value, or \`""\` if the record or field doesn't exist |
| \`DELETE key field\` | \`"true"\` if the field existed and was removed, else \`"false"\` |
`,
        tests: t("imdb", 1),
      },
      {
        title: "Level 2 — scanning",
        spec: `All level 1 operations still work (they're re-run as regression tests).

| operation | returns |
|---|---|
| \`SCAN key\` | all fields of the record as \`"f1(v1), f2(v2)"\`, fields sorted lexicographically; \`""\` if no record |
| \`SCAN_BY_PREFIX key prefix\` | same, but only fields starting with \`prefix\` |
`,
        tests: t("imdb", 2),
      },
      {
        title: "Level 3 — timestamps and TTL",
        spec: `Operations now carry an integer **timestamp** (non-decreasing across a test). A field set
with a TTL exists for \`t\` in \`[timestamp, timestamp + ttl)\` — at expiry it's gone.
Plain \`SET_AT\` (no TTL) never expires, and overwriting a field replaces its TTL.
Timestamped and plain operations are never mixed within one test.

| operation | returns |
|---|---|
| \`SET_AT key field value timestamp\` | \`""\` |
| \`SET_AT_WITH_TTL key field value timestamp ttl\` | \`""\` |
| \`DELETE_AT key field timestamp\` | \`"true"\` / \`"false"\` (an expired field counts as absent) |
| \`GET_AT key field timestamp\` | value or \`""\` |
| \`SCAN_AT key timestamp\` | like \`SCAN\`, only unexpired fields |
| \`SCAN_BY_PREFIX_AT key prefix timestamp\` | like \`SCAN_BY_PREFIX\` |
`,
        tests: t("imdb", 3),
      },
      {
        title: "Level 4 — backup and restore",
        spec: `| operation | returns |
|---|---|
| \`BACKUP timestamp\` | number of non-empty records saved, as a string |
| \`RESTORE timestamp restoreTimestamp\` | \`""\` |

\`RESTORE\` replaces the whole database with the **latest backup taken at or before**
\`restoreTimestamp\`. TTLs are recalculated: a field that had \`r\` seconds of life left when
the backup was taken expires at \`timestamp + r\` after the restore. Fields without TTL stay
permanent. If no backup qualifies, the database becomes empty.
`,
        tests: t("imdb", 4),
      },
    ],
  },
  {
    id: "storage",
    title: "Cloud Storage System",
    stage: "oa",
    difficulty: "hard",
    reported: true,
    timerMinutes: 90,
    starterCode: `def solution(queries):
    # queries: list[list[str]] -> list[str]
    results = []
    for q in queries:
        op = q[0]
        # TODO
        results.append("")
    return results
`,
    levels: [
      {
        title: "Level 1 — files",
        spec: `${QUERY_FORMAT}

| operation | returns |
|---|---|
| \`ADD_FILE name size\` | \`"true"\` if added, \`"false"\` if a file with that name exists |
| \`GET_FILE_SIZE name\` | the size, or \`""\` if missing |
| \`DELETE_FILE name\` | the deleted file's size, or \`""\` if missing |
`,
        tests: t("storage", 1),
      },
      {
        title: "Level 2 — largest files by prefix",
        spec: `| operation | returns |
|---|---|
| \`GET_N_LARGEST prefix n\` | up to \`n\` files whose **name** starts with \`prefix\`, as \`"name1(size1), name2(size2)"\` — sorted by size descending, ties by name ascending; \`""\` if none match |
`,
        tests: t("storage", 2),
      },
      {
        title: "Level 3 — users and capacity",
        spec: `Files added with \`ADD_FILE\` belong to an \`admin\` user with unlimited capacity.

| operation | returns |
|---|---|
| \`ADD_USER userId capacity\` | \`"true"\` if created, \`"false"\` if the user exists |
| \`ADD_FILE_BY userId name size\` | the user's **remaining capacity** after adding, or \`""\` if the user doesn't exist, the file name is taken, or it would exceed capacity |
| \`UPDATE_CAPACITY userId capacity\` | number of files removed to fit the new capacity, as a string; the user's **largest** files are removed first (ties by name ascending); \`""\` if no such user |

\`DELETE_FILE\` frees the owner's capacity.
`,
        tests: t("storage", 3),
      },
      {
        title: "Level 4 — compression",
        spec: `Sizes are always even.

| operation | returns |
|---|---|
| \`COMPRESS_FILE userId name\` | renames the file to \`name + ".COMPRESSED"\` and halves its size; returns the user's remaining capacity, or \`""\` if the file doesn't exist, belongs to someone else, or is already compressed |
| \`DECOMPRESS_FILE userId name\` | reverses it (pass the \`.COMPRESSED\` name); fails with \`""\` if the original name is taken, the user lacks capacity for the doubled size, it isn't compressed, or ownership doesn't match |
`,
        tests: t("storage", 4),
      },
    ],
  },

  {
    id: "banking",
    title: "Design Banking System",
    stage: "oa",
    difficulty: "hard",
    reported: true,
    timerMinutes: 90,
    starterCode: `class BankingSystem:
    def __init__(self):
        ...

    def create_account(self, timestamp, account_id):
        ...

    def deposit(self, timestamp, account_id, amount):
        ...

    def transfer(self, timestamp, source_id, target_id, amount):
        ...
`,
    levels: [
      {
        title: "Level 1 — accounts, deposits, transfers",
        spec: `This OA uses **method style**: implement the class, every method takes a \`timestamp\`
(ms, strictly increasing across all calls in a test).

- \`create_account(timestamp, account_id) -> bool\` — \`False\` if the id exists
- \`deposit(timestamp, account_id, amount) -> int | None\` — new balance; \`None\` if no account
- \`transfer(timestamp, source_id, target_id, amount) -> int | None\` — the **source's**
  balance after the transfer; \`None\` if either account is missing, source equals target, or
  funds are insufficient
`,
        tests: t("banking", 1),
      },
      {
        title: "Level 2 — top spenders",
        spec: `- \`top_spenders(timestamp, n) -> list[str]\` — accounts formatted \`"id(total_outgoing)"\`,
  ranked by total outgoing money (transfers out; later also payments) **descending**, ties by
  id **ascending**. Fewer than n accounts → return them all. Deposits and incoming money
  never count; cashback refunds (level 3) don't reduce outgoing.
`,
        tests: t("banking", 2),
      },
      {
        title: "Level 3 — payments with cashback",
        spec: `- \`pay(timestamp, account_id, amount) -> str | None\` — withdraws the amount and returns
  \`"payment1"\`, \`"payment2"\`, … (the ordinal is **global across all accounts**); \`None\` if
  the account is missing or funds are insufficient
- 2% cashback — \`amount * 2 // 100\` — is refunded to the account at exactly
  \`timestamp + 86400000\` (24h in ms). A cashback that falls due at time T must be applied
  **before** any operation processed at T.
- \`get_payment_status(timestamp, account_id, payment) -> str | None\` — \`"IN_PROGRESS"\`
  until the cashback lands, then \`"CASHBACK_RECEIVED"\`; \`None\` if the account or payment is
  unknown or the payment belongs to a different account
- \`pay\` amounts count toward \`top_spenders\`
`,
        tests: t("banking", 3),
      },
      {
        title: "Level 4 — merge and time travel",
        spec: `- \`merge_accounts(timestamp, account_id_1, account_id_2) -> bool\` — merges account 2
  **into** account 1; \`False\` if the ids are equal or either is missing. Balances and
  outgoing totals are summed, account 2's pending cashbacks will refund to account 1, its
  payments become queryable under account 1 (and \`None\` under account 2), and account 2
  disappears.
- \`get_balance(timestamp, account_id, time_at) -> int | None\` — the balance **after** all
  operations at \`time_at\` were processed; \`None\` if the account didn't exist yet at
  \`time_at\` or had already been merged away. Cashbacks show up in history at their refund
  time.
`,
        tests: t("banking", 4),
      },
    ],
  },
  {
    id: "recipes",
    title: "Design Recipe Management System",
    stage: "oa",
    difficulty: "medium",
    reported: true,
    timerMinutes: 90,
    starterCode: `class RecipeManager:
    def __init__(self):
        ...

    def add_recipe(self, recipe_id, name, ingredients, owner_id="admin"):
        ...

    def get_recipe(self, recipe_id):
        ...
`,
    levels: [
      {
        title: "Level 1 — CRUD with unique names",
        spec: `Method style. Recipe **names are globally unique case-insensitively** (stored and
returned with their original casing).

- \`add_recipe(recipe_id, name, ingredients, owner_id="admin") -> bool\` — \`False\` if the id
  is taken or the name collides (ignore \`owner_id\` until level 3; \`"admin"\` always exists)
- \`get_recipe(recipe_id) -> {"id", "name", "ingredients"} | None\`
- \`update_recipe(recipe_id, name, ingredients) -> bool\` — re-casing a recipe's **own** name
  is not a collision
- \`delete_recipe(recipe_id) -> bool\` — frees both the id and the name
`,
        tests: t("recipes", 1),
      },
      {
        title: "Level 2 — listing and search",
        spec: `- \`search_recipes(query) -> list[str]\` — ids of recipes whose **name** contains \`query\`
  case-insensitively
- \`list_recipes() -> list[str]\` — all ids

Both sorted by **ingredient count ascending**, ties by recipe id ascending. (Candidate
reports disagree on this tie-break — some say creation order — so ask in a real interview.)
`,
        tests: t("recipes", 2),
      },
      {
        title: "Level 3 — users and permissions",
        spec: `- \`add_user(user_id, username) -> bool\` — \`False\` if the id exists
- \`add_recipe(..., owner_id)\` now fails for unregistered owners
- \`grant_editor(owner_id, recipe_id, user_id) -> bool\` — only the owner grants, and only to
  registered users
- \`edit_recipe(user_id, recipe_id, name, ingredients) -> bool\` — owner or granted editor
- \`delete_recipe_as(user_id, recipe_id) -> bool\` — **owner only**
`,
        tests: t("recipes", 3),
      },
      {
        title: "Level 4 — version history and rollback",
        spec: `Every successful add is version 1 and every successful update/edit appends a version.

- \`get_recipe_history(recipe_id) -> list[{"version", "name", "ingredients"}] | None\`
- \`rollback_recipe(user_id, recipe_id, version) -> bool\` — copies that old version as a
  **new** version (numbers are never reused); same permissions as editing; fails if the
  version doesn't exist or that old name now belongs to another recipe
`,
        tests: t("recipes", 4),
      },
    ],
  },
  {
    id: "tasks",
    title: "Design a Task Assignment System",
    stage: "oa",
    difficulty: "hard",
    reported: true,
    timerMinutes: 90,
    starterCode: `class TaskManager:
    def __init__(self):
        ...

    def add_task(self, timestamp, name, priority):
        ...
`,
    levels: [
      {
        title: "Level 1 — tasks with generated ids",
        spec: `Method style; every method takes a \`timestamp\` (increasing).

- \`add_task(timestamp, name, priority) -> str\` — returns \`"task_id_1"\`, \`"task_id_2"\`, …
  (one global counter)
- \`update_task(timestamp, task_id, name, priority) -> bool\`
- \`get_task(timestamp, task_id) -> {"name", "priority"} | None\`

(The reported return shape for \`get_task\` varies between reports; this version uses a dict.)
`,
        tests: t("tasks", 1),
      },
      {
        title: "Level 2 — search and ordering",
        spec: `- \`search_tasks(timestamp, name_filter, max_results) -> list[str]\` — ids of tasks whose
  name contains \`name_filter\` (plain substring), sorted by **priority descending**, ties by
  **creation order ascending**, truncated to \`max_results\`; \`[]\` when \`max_results <= 0\`
- \`list_tasks_sorted(timestamp, limit) -> list[str]\` — same ordering over all tasks
`,
        tests: t("tasks", 2),
      },
      {
        title: "Level 3 — users, quotas, assignments",
        spec: `- \`add_user(timestamp, user_id, quota) -> bool\`
- \`assign_task(timestamp, task_id, user_id, finish_time) -> bool\` — fails if the task or
  user is unknown, or the user's count of assignments **active right now**
  (\`start <= now < finish\`, not completed) has reached their quota
- \`get_user_tasks(timestamp, user_id) -> list[str]\` — task ids of currently active
  assignments, sorted by \`(finish_time, start_time)\`
`,
        tests: t("tasks", 3),
      },
      {
        title: "Level 4 — completion and overdue work",
        spec: `- \`complete_task(timestamp, task_id, user_id) -> bool\` — completes that user's
  uncompleted assignment of the task; \`False\` if there is none
- \`get_overdue_assignments(timestamp, user_id) -> list[str]\` — ids of uncompleted
  assignments with \`finish_time <= now\`, sorted by \`(finish_time, start_time)\`
`,
        tests: t("tasks", 4),
      },
    ],
  },
  {
    id: "notes",
    title: "Design Note-Taking System",
    stage: "oa",
    difficulty: "medium",
    reported: false,
    timerMinutes: 90,
    starterCode: `class NoteSystem:
    def __init__(self):
        ...

    def create_note(self, timestamp, note_id, title, body, ttl=None):
        ...
`,
    levels: [
      {
        title: "Level 1 — notes CRUD",
        spec: `**Heads-up**: this title appears in the Anthropic question banks but no public spec
exists — this version is built from the recurring ICA template (CRUD → search → TTL →
time-travel) so the *shape* of the practice is right.

Method style; every method takes a \`timestamp\` (increasing).

- \`create_note(timestamp, note_id, title, body, ttl=None) -> bool\` — \`False\` if a live note
  has the id
- \`get_note(timestamp, note_id) -> {"id", "title", "body"} | None\`
- \`update_note(timestamp, note_id, title, body) -> bool\`
- \`delete_note(timestamp, note_id) -> bool\`
`,
        tests: t("notes", 1),
      },
      {
        title: "Level 2 — search",
        spec: `- \`search_notes(timestamp, query) -> list[str]\` — ids of notes whose **title or body**
  contains \`query\` case-insensitively, most recently **updated** first, ties by id ascending
`,
        tests: t("notes", 2),
      },
      {
        title: "Level 3 — expiring notes",
        spec: `\`create_note\`'s optional \`ttl\` makes the note exist for \`t\` in
\`[timestamp, timestamp + ttl)\`. An expired note is absent everywhere — reads, updates,
deletes, search — and its id can be reused.
`,
        tests: t("notes", 3),
      },
      {
        title: "Level 4 — time travel",
        spec: `- \`get_note_at(timestamp, note_id, time_at) -> {"id", "title", "body"} | None\` — the
  note's content as it stood at \`time_at\` (after all updates at that instant); \`None\`
  before creation or at/after expiry
`,
        tests: t("notes", 4),
      },
    ],
  },
  {
    id: "workers",
    title: "Design Worker Management System",
    stage: "oa",
    difficulty: "medium",
    reported: true,
    timerMinutes: 90,
    starterCode: `def solution(queries):
    # queries: list[list[str]] -> list[str]
    results = []
    for q in queries:
        op = q[0]
        # TODO
        results.append("")
    return results
`,
    levels: [
      {
        title: "Level 1 — clock in, clock out",
        spec: `${QUERY_FORMAT}

| operation | returns |
|---|---|
| \`ADD_WORKER workerId position compensation\` | \`"true"\`, or \`"false"\` if the id exists |
| \`REGISTER workerId timestamp\` | \`"registered"\`, or \`"invalid_request"\` for an unknown worker — calls alternate clock-in / clock-out; timestamps arrive increasing |
| \`GET workerId\` | total time in the office counting **finished sessions only**, or \`""\` for an unknown worker |
`,
        tests: t("workers", 1),
      },
      {
        title: "Level 2 — top workers by position",
        spec: `| operation | returns |
|---|---|
| \`TOP_N_WORKERS n position\` | \`"id1(time1), id2(time2)"\` — workers whose **current** position matches, sorted by total finished time descending, ties by id ascending; workers with no finished session count as 0 and are included; \`""\` if nobody holds the position |
`,
        tests: t("workers", 2),
      },
      {
        title: "Level 3 — promotions and salary",
        spec: `| operation | returns |
|---|---|
| \`PROMOTE workerId newPosition newCompensation startTimestamp\` | \`"success"\`, or \`"invalid_request"\` if the worker is unknown or an unapplied promotion is already pending |
| \`CALC_SALARY workerId startTimestamp endTimestamp\` | total salary in the half-open interval \`[start, end)\`, or \`""\` for an unknown worker |

A promotion takes effect at the worker's first **clock-in** at or after \`startTimestamp\`.
\`TOP_N_WORKERS\` uses the current position; \`GET\` still counts time across all positions.
Salary: for each finished session, \`overlap_with_the_interval × compensation\`, where the
compensation is the one in effect **at that session's clock-in**.
`,
        tests: t("workers", 3),
      },
      {
        title: "Level 4 — double-paid periods",
        spec: `| operation | returns |
|---|---|
| \`SET_DOUBLE_PAID startTimestamp endTimestamp\` | \`"success"\` — adds a company-wide double-pay interval \`[start, end)\` |

Overlapping double-pay intervals must be **unioned** — time is doubled, never tripled. The
doubled portion of a session adds one extra compensation rate on top of normal pay:
rate 10, session \`[0, 40)\`, double-paid \`[5, 25)\` and \`[20, 35)\` → union \`[5, 35)\` →
\`40×10 + 30×10 = 700\`. \`CALC_SALARY\` clips everything to its query interval.
`,
        tests: t("workers", 4),
      },
    ],
  },

  // ───────────────────────── Screening ─────────────────────────
  {
    id: "tokenizer",
    title: "String Tokenization",
    stage: "screening",
    difficulty: "medium",
    reported: true,
    timerMinutes: 60,
    starterCode: `def longest_match_tokenize(text, vocab):
    # -> list[int]  (token ids = index into vocab)
    ...


def tokenize_with_unknowns(text, vocab):  # level 2
    # -> list[tuple[int, str]]
    ...
`,
    levels: [
      {
        title: "Level 1 — greedy longest match",
        spec: `Implement \`longest_match_tokenize(text, vocab) -> list[int]\`.

A token's **id is its index in \`vocab\`**. Starting at position 0, repeatedly take the
**longest** vocab string that matches at the current position, emit its id, and advance past
it. Purely greedy — no backtracking, case-sensitive, spaces and punctuation are ordinary
characters. Every single character of \`text\` is guaranteed to be in \`vocab\`, so you can
never get stuck.

Example: \`text="abcab"\`, \`vocab=["a","b","c","ab","abc"]\` → \`[4, 3]\` (\`"abc"\` then \`"ab"\`).

Constraints worth designing for: \`len(text) ≤ 1e5\`, \`len(vocab) ≤ 1e4\`, vocab strings up to
50 chars. (A dict of vocab bucketed by first character, or a trie, beats scanning the whole
vocab at every position — the interviewer will ask.)
`,
        tests: t("tokenizer", 1),
      },
      {
        title: "Level 2 — unknown characters",
        spec: `Implement \`tokenize_with_unknowns(text, vocab) -> list[tuple[int, str]]\`.

Same greedy rule, but now the single-character guarantee is gone. Emit \`(id, matched_text)\`
for known tokens. Characters that match nothing are **coalesced into runs** and emitted as
one \`(-1, run)\` tuple per maximal run.

Example: \`"hi!?yo"\` with \`vocab=["hi","yo","h"]\` → \`[(0, "hi"), (-1, "!?"), (1, "yo")]\`.
`,
        tests: t("tokenizer", 2),
      },
    ],
  },
  {
    id: "crawler",
    title: "Concurrent Web Crawler",
    stage: "screening",
    difficulty: "medium",
    reported: true,
    timerMinutes: 60,
    starterCode: `def crawl(start_url, web):
    # web.get(url, []) -> outgoing links. Return sorted list of visited urls.
    ...


def crawl_concurrent(start_url, web, max_workers=8):  # level 2
    import threading
    ...
`,
    levels: [
      {
        title: "Level 1 — single-threaded crawl",
        spec: `Implement \`crawl(start_url, web) -> list[str]\` where \`web.get(url, [])\` returns a page's
outgoing links (a stand-in for a slow black-box \`HtmlParser.getUrls\`).

Rules (exactly as reported):
- Only follow links on the **same hostname** as the start URL — the part between \`//\` and the
  next \`/\`. **No other normalization**: \`http://a.com\`, \`http://a.com/\` and \`http://a.com:80\`
  are three different pages.
- **Strip the fragment** (\`#...\`) from every URL before dedup and output.
- The graph has cycles — never fetch the same sanitized URL twice.
- Return the visited URLs **sorted lexicographically**.
`,
        tests: t("crawler", 1),
      },
      {
        title: "Level 2 — make it concurrent",
        spec: `> ⚠️ **This level cannot run on the in-browser (pyodide/WASM) engine** — WASM Python
> can't start threads, so \`Thread.start()\` raises \`RuntimeError\`. Start the local backend
> (\`scripts/.venv-interview/bin/python scripts/interview_server.py\`) to run it for real.

Implement \`crawl_concurrent(start_url, web, max_workers=8)\` with real threads
(\`threading\` / \`concurrent.futures\`). Same results as level 1 — the tests check
correctness; the concurrency discipline is the point:

- mark a URL as visited **before** handing it to a worker, not after the fetch returns
- a thread-safe frontier (e.g. \`queue.Queue\`) and a lock around the visited set
- termination: how do you know the crawl is done? (track in-flight work — \`Queue.join\`,
  or a counter under the lock)

In the real screen you'd be asked to talk through worker-pool sizing and what breaks
without the lock. Practice saying it out loud.
`,
        tests: t("crawler", 2),
      },
    ],
  },
  {
    id: "cluster",
    title: "Find Cluster Mode and Median",
    stage: "screening",
    difficulty: "hard",
    reported: true,
    timerMinutes: 60,
    starterCode: `def cluster_stats(partitions):
    # -> (mode, median)
    ...


def plan_aggregation(partitions, value_range=None):  # level 2
    # -> (mode, median, strategy, bytes_sent, read_seconds, network_seconds, total_seconds)
    ...
`,
    levels: [
      {
        title: "Level 1 — exact mode and median",
        spec: `A cluster of worker nodes each holds a partition of integers. Implement
\`cluster_stats(partitions) -> (mode, median)\` over **all** values:

- **mode**: most frequent value; ties go to the **smallest** value
- **median**: for an even count, the average of the two middle values — an \`int\` when it's
  whole, otherwise a float
- empty cluster → \`(None, None)\`
`,
        tests: t("cluster", 1),
      },
      {
        title: "Level 2 — minimize bytes over the wire",
        spec: `The real question: reading local data costs **10 bytes/sec** per worker (in parallel),
the network moves **1 byte/sec** (total), so bytes sent dominate. Implement
\`plan_aggregation(partitions, value_range=None)\` returning the tuple
\`(mode, median, strategy, bytes_sent, read_seconds, network_seconds, total_seconds)\`.

Each worker can send its data one of three ways:
- \`"raw"\` — 4 bytes per integer
- \`"sparse_counts"\` — 8 bytes per **distinct value on that worker** (value, count pairs)
- \`"dense_histogram"\` — 4 bytes per bucket per worker, buckets = \`hi - lo + 1\`; only
  allowed when \`value_range=(lo, hi)\` is given **and** every value fits in it

Pick the cheapest total; break ties dense > sparse > raw. Costs:
\`read_seconds = 4 × (largest partition length) / 10\` (reads are parallel),
\`network_seconds = bytes_sent / 1\`, \`total = read + network\`.

Worked example from the reports: \`[[1,1,1,1,2,2],[2,2,2,3,3,3],[1,1,3,3,3,3]]\` with range
\`(1,3)\` → \`(3, 2, "dense_histogram", 36, 2.4, 36.0, 38.4)\`.

Be ready to discuss: skewed vs uniform data, unknown value ranges, tree vs star aggregation,
and when naive gather is actually optimal.
`,
        tests: t("cluster", 2),
      },
    ],
  },
  {
    id: "dupfiles",
    title: "Find Duplicate Files",
    stage: "screening",
    difficulty: "hard",
    reported: true,
    timerMinutes: 60,
    starterCode: `def find_duplicates(fs):
    # fs: nested dict. dir = dict; file = ("file", content);
    # unreadable = ("error", reason); changed mid-scan = ("changed", old, new)
    ...
`,
    levels: [
      {
        title: "Level 1 — the full variant",
        spec: `A filesystem is a nested dict: a **directory** is a dict, a **file** is \`("file", content)\`,
an **unreadable file** is \`("error", reason)\` and a file that **changed during the scan** is
\`("changed", old_content, new_content)\`. Implement \`find_duplicates(fs)\`:

- return groups (lists) of \`/\`-joined relative paths whose contents are identical
- only groups of **2+** files; each group sorted lexicographically; groups sorted by their
  first path
- skip \`error\` files entirely; \`changed\` files may be used for cheap size-grouping
  (\`len(old)\`) but must be **skipped at the hashing stage** — so they never appear in output

The expected pipeline (the interviewer walks you through it): recursive scan → group by
**size** (a unique size can't be a duplicate) → hash same-size candidates (chunked SHA-256,
not whole-file reads) → group by hash. Follow-ups to rehearse: I/O-bound or CPU-bound?
billions of files? parallelize which stage? near-realtime detection?
`,
        tests: t("dupfiles", 1),
      },
    ],
  },
  {
    id: "profiling",
    title: "Generate Function Profiling Events",
    stage: "screening",
    difficulty: "hard",
    reported: true,
    timerMinutes: 60,
    starterCode: `def samples_to_trace(samples):
    # samples: list[(timestamp, stack)] with stack[0] outermost
    # -> list[(timestamp, "START"|"END", name)]
    ...


def profile_events(samples, n):  # level 2: debounce threshold n
    ...
`,
    levels: [
      {
        title: "Level 1 — stack samples to trace events",
        spec: `A sampling profiler produced chronological samples \`(timestamp, stack)\` where
\`stack[0]\` is the outermost frame. Implement \`samples_to_trace(samples)\` returning
\`(timestamp, "START"|"END", name)\` events that reconstruct the execution trace:

- diff each sample against the previous one by **longest common prefix**: close the dropped
  frames (innermost first), then open the added frames (outermost first), all at the new
  sample's timestamp
- a frame's identity is its **position**: \`["f", "f"]\` is \`f\` calling \`f\`
- identical consecutive samples emit nothing
- after the last sample, close every open frame **at the last timestamp**
`,
        tests: t("profiling", 1),
      },
      {
        title: "Level 2 — debounce threshold",
        spec: `Samples are noisy. Implement \`profile_events(samples, n)\`:

- a frame **STARTs** once it has appeared in \`n\` consecutive samples — the event's timestamp
  is the **first** sample of that run
- a frame **ENDs** once absent for \`n\` consecutive samples — timestamp of the first absence
- shorter runs emit nothing and reset the opposing counter; churn **below** a frame doesn't
  reset it; a frame can't outlive its ancestor
- within one timestamp: ENDs deepest-first, then STARTs outermost-first
- still-open frames flush an END at the last timestamp; \`n=1\` reduces to level 1

Example (\`n=2\`): \`(10,[A,B]) (20,[A,C]) (30,[A,C]) (40,[]) (50,[])\` →
\`(10,START,A) (20,START,C) (40,END,C) (40,END,A)\` — \`B\` never appears twice in a row.
Aim for O(total stack entries) time.
`,
        tests: t("profiling", 2),
      },
    ],
  },

  // ───────────────────────── Onsite ─────────────────────────
  {
    id: "bootloader",
    title: "Repair Bootloader Program",
    stage: "onsite",
    difficulty: "hard",
    reported: true,
    timerMinutes: 55,
    starterCode: `def run(program):
    # -> ("halt", acc) or ("loop", acc)
    ...


def repair(program):  # level 2
    # -> final acc after the one-instruction fix
    ...
`,
    levels: [
      {
        title: "Level 1 — simulate and detect the loop",
        spec: `A tiny bootloader runs on a machine with an **instruction pointer** (start 0) and an
**accumulator** (start 0). The program is a list of strings:

- \`acc ±n\` — add n to the accumulator, move to the next instruction
- \`jmp ±n\` — jump n instructions relative to itself
- \`nop ±n\` — do nothing, move to the next instruction

The program **halts** when the pointer lands exactly one past the last instruction.
Implement \`run(program)\`: return \`("halt", acc)\` on halt, or — the moment any instruction
is about to execute a **second** time — \`("loop", acc)\` with the accumulator as it stands.
`,
        tests: t("bootloader", 1),
      },
      {
        title: "Level 2 — fix the corruption",
        spec: `Exactly one control-flow instruction is corrupted: a single \`jmp\` should be a \`nop\`
or vice versa (arguments are intact, \`acc\` instructions are never wrong). Implement
\`repair(program)\`: find the one swap that makes the program halt and return the final
accumulator value.

Brute force (try each swap, re-run) is fine first; the discussion follow-up is how to do it
in one pass (which pointer positions can reach the end?).
`,
        tests: t("bootloader", 2),
      },
    ],
  },
  {
    id: "cache",
    title: "Design Durable Function Call Cache",
    stage: "onsite",
    difficulty: "hard",
    reported: true,
    timerMinutes: 55,
    starterCode: `class LRUCache:
    def __init__(self, capacity, file_path=None):
        ...

    def get(self, key):
        ...

    def put(self, key, value):
        ...


def make_key(func, args, kwargs):  # level 2
    import inspect
    ...


def memoize(cache):  # level 2
    def deco(func):
        ...
    return deco
`,
    levels: [
      {
        title: "Level 1 — an LRU cache",
        spec: `Implement \`LRUCache(capacity)\` with \`get(key) -> value | None\` and \`put(key, value)\`,
both **O(1)** (excluding key construction):

- at capacity, \`put\` evicts the **least recently used** entry
- both a \`get\` hit and a \`put\` (new or overwrite) refresh an entry's recency

(\`collections.OrderedDict\` or a dict + doubly-linked list — be ready to justify either.)
`,
        tests: t("cache", 1),
      },
      {
        title: "Level 2 — keys and the memoize decorator",
        spec: `One cache serves many functions. Implement \`make_key(func, args, kwargs)\` and a
\`@memoize(cache)\` decorator such that:

- **equivalent calls share a key**: \`f(1, 2)\`, \`f(1)\` (with \`b=2\` default), \`f(a=1, b=2)\`
  and \`f(b=2, a=1)\` all hit the same entry (\`inspect.signature(...).bind\` +
  \`apply_defaults\` is the clean route)
- identical args to **different functions** must not collide
- **unhashable arguments** (lists, dicts) must work
- a cached \`None\` return is a **hit**, not a miss — don't call the function again
`,
        tests: t("cache", 2),
      },
      {
        title: "Level 3 — survive a crash",
        spec: `\`LRUCache(capacity, file_path)\` becomes durable: append every mutation to the file as a
log record and flush, so a **new cache constructed on the same path** rebuilds both the
contents **and the exact recency order** (eviction after recovery must match — which means
logging \`get\` hits too). Requirements tested:

- contents survive a restart
- recency order survives a restart
- a **torn final record** (crash mid-write) is tolerated: replay stops there

Keys are strings and values JSON-serializable in the tests. Discussion follow-ups from the
reports: log compaction that survives a crash mid-compaction, two processes sharing the
file, TTL × recovery, flush vs fsync, unserializable return values.
`,
        tests: t("cache", 3),
      },
    ],
  },
];
