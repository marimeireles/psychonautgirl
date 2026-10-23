import{c as v,u as le,r as l,j as t,S as ce,C as de,M as pe,b as me,a as k}from"./index-twxTatI3.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=v("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue=v("CircleX",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const he=v("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fe=v("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=v("RotateCcw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=v("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=v("Timer",[["line",{x1:"10",x2:"14",y1:"2",y2:"2",key:"14vaq8"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11",key:"17fdiu"}],["circle",{cx:"12",cy:"14",r:"8",key:"1e1u0o"}]]),ge={imdb:{1:[{name:"set & get basics",call:'solution([["SET", "A", "B", "E"], ["SET", "A", "C", "F"], ["GET", "A", "B"], ["GET", "A", "D"], ["GET", "Z", "B"], ["SET", "A", "B", "G"], ["GET", "A", "B"]])',expected:"['', '', 'E', '', '', '', 'G']"},{name:"delete semantics",call:'solution([["SET", "A", "B", "E"], ["DELETE", "A", "B"], ["DELETE", "A", "B"], ["GET", "A", "B"], ["DELETE", "Z", "Q"], ["SET", "A", "B", "X"], ["GET", "A", "B"]])',expected:"['', 'true', 'false', '', 'false', '', 'X']"},{name:"multiple records",call:'solution([["SET", "user1", "name", "mari"], ["SET", "user2", "name", "ada"], ["GET", "user1", "name"], ["GET", "user2", "name"], ["DELETE", "user1", "name"], ["GET", "user1", "name"], ["GET", "user2", "name"]])',expected:"['', '', 'mari', 'ada', 'true', '', 'ada']"}],2:[{name:"scan sorts fields",call:'solution([["SET", "A", "BC", "E"], ["SET", "A", "BD", "F"], ["SET", "A", "C", "G"], ["SCAN_BY_PREFIX", "A", "B"], ["SCAN", "A"], ["SCAN_BY_PREFIX", "B", "B"]])',expected:"['', '', '', 'BC(E), BD(F)', 'BC(E), BD(F), C(G)', '']"},{name:"scan after deletes",call:'solution([["SET", "A", "x", "1"], ["SET", "A", "y", "2"], ["SET", "A", "z", "3"], ["DELETE", "A", "y"], ["SCAN", "A"], ["DELETE", "A", "x"], ["DELETE", "A", "z"], ["SCAN", "A"]])',expected:"['', '', '', 'true', 'x(1), z(3)', 'true', 'true', '']"},{name:"prefix edge cases",call:'solution([["SET", "db", "key", "1"], ["SET", "db", "keyboard", "2"], ["SET", "db", "kettle", "3"], ["SCAN_BY_PREFIX", "db", "key"], ["SCAN_BY_PREFIX", "db", "ke"], ["SCAN_BY_PREFIX", "db", ""], ["SCAN_BY_PREFIX", "nope", "k"]])',expected:"['', '', '', 'key(1), keyboard(2)', 'kettle(3), key(1), keyboard(2)', 'kettle(3), key(1), keyboard(2)', '']"}],3:[{name:"ttl expiry",call:'solution([["SET_AT_WITH_TTL", "A", "BC", "E", "1", "9"], ["SET_AT_WITH_TTL", "A", "BC", "E", "5", "10"], ["SET_AT", "A", "BD", "F", "5"], ["SCAN_BY_PREFIX_AT", "A", "B", "14"], ["SCAN_BY_PREFIX_AT", "A", "B", "15"], ["GET_AT", "A", "BC", "14"], ["GET_AT", "A", "BC", "15"]])',expected:"['', '', '', 'BC(E), BD(F)', 'BD(F)', 'E', '']"},{name:"delete_at honours expiry",call:'solution([["SET_AT", "A", "B", "4", "0"], ["SET_AT_WITH_TTL", "X", "Y", "5", "1", "6"], ["GET_AT", "X", "Y", "4"], ["SCAN_AT", "X", "6"], ["SCAN_AT", "X", "7"], ["DELETE_AT", "X", "Y", "8"], ["DELETE_AT", "A", "B", "8"], ["GET_AT", "A", "B", "9"]])',expected:"['', '', '5', 'Y(5)', '', 'false', 'true', '']"},{name:"overwrite clears ttl",call:'solution([["SET_AT_WITH_TTL", "A", "f", "1", "0", "5"], ["SET_AT", "A", "f", "2", "3"], ["GET_AT", "A", "f", "100"], ["SET_AT_WITH_TTL", "A", "f", "3", "100", "2"], ["GET_AT", "A", "f", "101"], ["GET_AT", "A", "f", "102"]])',expected:"['', '', '2', '', '3', '']"}],4:[{name:"backup counts records",call:'solution([["SET_AT_WITH_TTL", "A", "B", "C", "1", "10"], ["BACKUP", "3"], ["SET_AT", "A", "D", "E", "4"], ["BACKUP", "5"], ["DELETE_AT", "A", "B", "8"], ["BACKUP", "9"], ["RESTORE", "10", "7"], ["BACKUP", "11"], ["SCAN_AT", "A", "15"], ["SCAN_AT", "A", "16"]])',expected:"['', '1', '', '1', 'true', '1', '', '1', 'B(C), D(E)', 'D(E)']"},{name:"restore recalculates ttl",call:'solution([["SET_AT_WITH_TTL", "A", "f", "v", "0", "10"], ["BACKUP", "5"], ["RESTORE", "20", "6"], ["GET_AT", "A", "f", "24"], ["GET_AT", "A", "f", "25"]])',expected:"['', '1', '', 'v', '']"},{name:"restore picks latest backup <= t",call:'solution([["SET_AT", "k", "a", "1", "0"], ["BACKUP", "1"], ["SET_AT", "k", "b", "2", "2"], ["BACKUP", "3"], ["SET_AT", "k", "c", "3", "4"], ["RESTORE", "5", "3"], ["SCAN_AT", "k", "6"], ["RESTORE", "7", "2"], ["SCAN_AT", "k", "8"]])',expected:"['', '1', '', '1', '', '', 'a(1), b(2)', '', 'a(1)']"}]},storage:{1:[{name:"add & size",call:'solution([["ADD_FILE", "/dir/file.txt", "10"], ["ADD_FILE", "/dir/file.txt", "5"], ["GET_FILE_SIZE", "/dir/file.txt"], ["GET_FILE_SIZE", "/nope.txt"]])',expected:"['true', 'false', '10', '']"},{name:"delete returns size",call:'solution([["ADD_FILE", "/a.mp3", "800"], ["DELETE_FILE", "/a.mp3"], ["DELETE_FILE", "/a.mp3"], ["GET_FILE_SIZE", "/a.mp3"], ["ADD_FILE", "/a.mp3", "900"], ["GET_FILE_SIZE", "/a.mp3"]])',expected:"['true', '800', '', '', 'true', '900']"}],2:[{name:"largest sorts by size then name",call:'solution([["ADD_FILE", "/dir/a.txt", "10"], ["ADD_FILE", "/dir/b.txt", "30"], ["ADD_FILE", "/dir/c.txt", "30"], ["ADD_FILE", "/zzz.txt", "99"], ["GET_N_LARGEST", "/dir", "2"], ["GET_N_LARGEST", "/dir", "10"], ["GET_N_LARGEST", "/x", "3"]])',expected:"['true', 'true', 'true', 'true', '/dir/b.txt(30), /dir/c.txt(30)', '/dir/b.txt(30), /dir/c.txt(30), /dir/a.txt(10)', '']"},{name:"largest respects deletes",call:'solution([["ADD_FILE", "/f1", "5"], ["ADD_FILE", "/f2", "7"], ["ADD_FILE", "/f3", "3"], ["DELETE_FILE", "/f2"], ["GET_N_LARGEST", "/f", "2"], ["GET_N_LARGEST", "", "1"]])',expected:"['true', 'true', 'true', '7', '/f1(5), /f3(3)', '/f1(5)']"}],3:[{name:"user capacity",call:'solution([["ADD_USER", "u1", "100"], ["ADD_USER", "u1", "200"], ["ADD_FILE_BY", "u1", "/u1/a", "60"], ["ADD_FILE_BY", "u1", "/u1/b", "50"], ["ADD_FILE_BY", "u1", "/u1/c", "40"], ["ADD_FILE_BY", "ghost", "/g", "1"], ["GET_FILE_SIZE", "/u1/b"]])',expected:"['true', 'false', '40', '', '0', '', '']"},{name:"update capacity evicts largest first",call:'solution([["ADD_USER", "u1", "100"], ["ADD_FILE_BY", "u1", "/a", "30"], ["ADD_FILE_BY", "u1", "/b", "40"], ["ADD_FILE_BY", "u1", "/c", "20"], ["UPDATE_CAPACITY", "u1", "50"], ["GET_FILE_SIZE", "/b"], ["GET_FILE_SIZE", "/a"], ["GET_FILE_SIZE", "/c"], ["UPDATE_CAPACITY", "ghost", "10"]])',expected:"['true', '70', '30', '10', '1', '', '30', '20', '']"},{name:"delete frees capacity",call:'solution([["ADD_USER", "u1", "50"], ["ADD_FILE_BY", "u1", "/x", "50"], ["ADD_FILE_BY", "u1", "/y", "1"], ["DELETE_FILE", "/x"], ["ADD_FILE_BY", "u1", "/y", "30"]])',expected:"['true', '0', '', '50', '20']"}],4:[{name:"compress halves and frees",call:'solution([["ADD_USER", "u1", "100"], ["ADD_FILE_BY", "u1", "/dir/f", "80"], ["COMPRESS_FILE", "u1", "/dir/f"], ["GET_FILE_SIZE", "/dir/f"], ["GET_FILE_SIZE", "/dir/f.COMPRESSED"], ["ADD_FILE_BY", "u1", "/dir/g", "60"]])',expected:"['true', '20', '60', '', '40', '0']"},{name:"decompress checks capacity",call:'solution([["ADD_USER", "u1", "100"], ["ADD_FILE_BY", "u1", "/f", "80"], ["COMPRESS_FILE", "u1", "/f"], ["ADD_FILE_BY", "u1", "/g", "50"], ["DECOMPRESS_FILE", "u1", "/f.COMPRESSED"], ["DELETE_FILE", "/g"], ["DECOMPRESS_FILE", "u1", "/f.COMPRESSED"], ["GET_FILE_SIZE", "/f"]])',expected:"['true', '20', '60', '10', '', '50', '20', '80']"},{name:"compress ownership rules",call:'solution([["ADD_USER", "u1", "100"], ["ADD_USER", "u2", "100"], ["ADD_FILE_BY", "u1", "/f", "20"], ["COMPRESS_FILE", "u2", "/f"], ["COMPRESS_FILE", "u1", "/nope"], ["COMPRESS_FILE", "u1", "/f"], ["COMPRESS_FILE", "u1", "/f.COMPRESSED"]])',expected:"['true', 'true', '80', '', '', '90', '']"}]},bootloader:{1:[{name:"detects the loop",call:"run(['nop +0', 'acc +1', 'jmp +4', 'acc +3', 'jmp -3', 'acc -99', 'acc +1', 'jmp -4', 'acc +6'])",expected:"('loop', 5)"},{name:"clean halt",call:"run(['acc +5', 'nop +2', 'acc -2', 'jmp +1', 'acc +10'])",expected:"('halt', 13)"},{name:"loop without acc repeats",call:"run(['jmp +2', 'acc +7', 'acc +3', 'jmp -2', 'acc +1'])",expected:"('loop', 10)"},{name:"empty program halts",call:"run([])",expected:"('halt', 0)"}],2:[{name:"repairs the classic",call:"repair(['nop +0', 'acc +1', 'jmp +4', 'acc +3', 'jmp -3', 'acc -99', 'acc +1', 'jmp -4', 'acc +6'])",expected:"8"},{name:"repair bigger program",call:"repair(['acc +1', 'jmp +3', 'acc +100', 'jmp +4', 'acc +2', 'jmp -3', 'acc +4', 'jmp -7', 'acc +8'])",expected:"111"},{name:"repair tiny loop",call:"repair(['jmp +0'])",expected:"0"}]},cache:{1:[{name:"basic put/get",setup:`c = LRUCache(2)
c.put('a', 1)
c.put('b', 2)`,call:"(c.get('a'), c.get('b'), c.get('zz'))",expected:"(1, 2, None)"},{name:"evicts least recently used",setup:`c = LRUCache(2)
c.put('a', 1)
c.put('b', 2)
c.get('a')
c.put('c', 3)`,call:"(c.get('a'), c.get('b'), c.get('c'))",expected:"(1, None, 3)"},{name:"put refreshes recency",setup:`c = LRUCache(2)
c.put('a', 1)
c.put('b', 2)
c.put('a', 9)
c.put('c', 3)`,call:"(c.get('a'), c.get('b'), c.get('c'))",expected:"(9, None, 3)"}],2:[{name:"equivalent call shapes share a key",setup:`c = LRUCache(10)
ncalls = 0
@memoize(c)
def add(a, b=2):
    global ncalls
    ncalls += 1
    return a + b
r = (add(1, 2), add(1), add(a=1, b=2), add(b=2, a=1), add(2, 2))`,call:"(r, ncalls)",expected:"((3, 3, 3, 3, 4), 2)"},{name:"same args, different functions",setup:`c = LRUCache(10)
@memoize(c)
def f(x):
    return x + 1
@memoize(c)
def g(x):
    return x - 1`,call:"(f(5), g(5), f(5), g(5))",expected:"(6, 4, 6, 4)"},{name:"cached None is not a miss",setup:`c = LRUCache(10)
ncalls = 0
@memoize(c)
def nothing(x):
    global ncalls
    ncalls += 1
    return None
r = (nothing(1), nothing(1), nothing(1))`,call:"(r, ncalls)",expected:"((None, None, None), 1)"},{name:"unhashable arguments work",setup:`c = LRUCache(10)
ncalls = 0
@memoize(c)
def total(xs):
    global ncalls
    ncalls += 1
    return sum(xs)
r = (total([1, 2]), total([1, 2]), total([3]))`,call:"(r, ncalls)",expected:"((3, 3, 3), 2)"}],3:[{name:"contents survive a restart",setup:`import tempfile, os
p = os.path.join(tempfile.mkdtemp(), 'c.log')
c = LRUCache(3, p)
c.put('a', 1)
c.put('b', 2)
d = LRUCache(3, p)`,call:"(d.get('a'), d.get('b'))",expected:"(1, 2)"},{name:"recency order survives a restart",setup:`import tempfile, os
p = os.path.join(tempfile.mkdtemp(), 'c.log')
c = LRUCache(2, p)
c.put('a', 1)
c.put('b', 2)
c.get('a')
d = LRUCache(2, p)
d.put('c', 3)`,call:"(d.get('a'), d.get('b'), d.get('c'))",expected:"(1, None, 3)"},{name:"torn final record is tolerated",setup:`import tempfile, os
p = os.path.join(tempfile.mkdtemp(), 'c.log')
c = LRUCache(3, p)
c.put('a', 1)
c.put('b', 2)
with open(p, 'a') as fh:
    fh.write('{"op": "put", "k": "zz')
d = LRUCache(3, p)`,call:"(d.get('a'), d.get('b'), d.get('zz'))",expected:"(1, 2, None)"}]},tokenizer:{1:[{name:"greedy picks longest",call:"longest_match_tokenize('abcab', ['a', 'b', 'c', 'ab', 'abc'])",expected:"[4, 3]"},{name:"greedy beats optimal",call:"longest_match_tokenize('abcd', ['a', 'b', 'c', 'd', 'ab', 'bcd'])",expected:"[4, 2, 3]"},{name:"spaces are ordinary chars",call:"longest_match_tokenize('to be', [' ', 'b', 'e', 'o', 't', 'to', 'be', ' b'])",expected:"[5, 7, 2]"},{name:"empty text",call:"longest_match_tokenize('', ['a'])",expected:"[]"}],2:[{name:"unknown run is coalesced",call:"tokenize_with_unknowns('hi!?yo', ['hi', 'yo', 'h'])",expected:"[(0, 'hi'), (-1, '!?'), (1, 'yo')]"},{name:"known tokens carry text",call:"tokenize_with_unknowns('abab', ['ab', 'a'])",expected:"[(0, 'ab'), (0, 'ab')]"},{name:"all unknown",call:"tokenize_with_unknowns('zzz', ['a'])",expected:"[(-1, 'zzz')]"},{name:"trailing unknown run",call:"tokenize_with_unknowns('ab??', ['ab'])",expected:"[(0, 'ab'), (-1, '??')]"}]},cluster:{1:[{name:"mode and median",call:"cluster_stats([[1, 1, 1, 1, 2, 2], [2, 2, 2, 3, 3, 3], [1, 1, 3, 3, 3, 3]])",expected:"(3, 2)"},{name:"tie goes to smallest",call:"cluster_stats([[5, 5, 9], [9, 9, 1, 1]])",expected:"(9, 5)"},{name:"even count fractional median",call:"cluster_stats([[1, 2], [3, 4]])",expected:"(1, 2.5)"},{name:"empty cluster",call:"cluster_stats([[], []])",expected:"(None, None)"}],2:[{name:"worked example (dense)",call:"plan_aggregation([[1, 1, 1, 1, 2, 2], [2, 2, 2, 3, 3, 3], [1, 1, 3, 3, 3, 3]], (1, 3))",expected:"(3, 2, 'dense_histogram', 36, 2.4, 36.0, 38.4)"},{name:"no range -> sparse vs raw",call:"plan_aggregation([[7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7], [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]])",expected:"(7, 7.5, 'sparse_counts', 16, 20.0, 16.0, 36.0)"},{name:"raw wins when all distinct",call:"plan_aggregation([[10, 20], [30, 40]])",expected:"(10, 25, 'raw', 16, 0.8, 16.0, 16.8)"},{name:"values outside range disable dense",call:"plan_aggregation([[1, 99]], (1, 3))",expected:"(1, 50, 'raw', 8, 0.8, 8.0, 8.8)"}]},profiling:{1:[{name:"worked example",call:"samples_to_trace([(1, ['main']), (2, ['main', 'foo']), (3, ['main', 'foo', 'bar']), (4, ['main', 'baz']), (5, ['main'])])",expected:"[(1, 'START', 'main'), (2, 'START', 'foo'), (3, 'START', 'bar'), (4, 'END', 'bar'), (4, 'END', 'foo'), (4, 'START', 'baz'), (5, 'END', 'baz'), (5, 'END', 'main')]"},{name:"duplicate names at depths",call:"samples_to_trace([(1, ['f', 'f']), (2, ['f', 'f']), (3, ['f'])])",expected:"[(1, 'START', 'f'), (1, 'START', 'f'), (3, 'END', 'f'), (3, 'END', 'f')]"},{name:"identical samples emit nothing new",call:"samples_to_trace([(1, ['a']), (2, ['a']), (3, ['a'])])",expected:"[(1, 'START', 'a'), (3, 'END', 'a')]"},{name:"empty input",call:"samples_to_trace([])",expected:"[]"}],2:[{name:"debounce worked example (n=2)",call:"profile_events([(10, ['A', 'B']), (20, ['A', 'C']), (30, ['A', 'C']), (40, []), (50, [])], 2)",expected:"[(10, 'START', 'A'), (20, 'START', 'C'), (40, 'END', 'C'), (40, 'END', 'A')]"},{name:"short blip is ignored",call:"profile_events([(1, ['m']), (2, ['m', 'x']), (3, ['m']), (4, ['m'])], 2)",expected:"[(1, 'START', 'm'), (4, 'END', 'm')]"},{name:"n=1 matches plain trace",call:"profile_events([(1, ['main']), (2, ['main', 'foo']), (3, ['main', 'foo', 'bar']), (4, ['main', 'baz']), (5, ['main'])], 1)",expected:"[(1, 'START', 'main'), (2, 'START', 'foo'), (3, 'START', 'bar'), (4, 'END', 'bar'), (4, 'END', 'foo'), (4, 'START', 'baz'), (5, 'END', 'baz'), (5, 'END', 'main')]"},{name:"frame dies with its ancestor",call:"profile_events([(1, ['a', 'b']), (2, ['a', 'b']), (3, []), (4, [])], 2)",expected:"[(1, 'START', 'a'), (1, 'START', 'b'), (3, 'END', 'b'), (3, 'END', 'a')]"}]},dupfiles:{1:[{name:"groups duplicates, skips error/changed",call:"find_duplicates({'home': {'a.txt': ('file', 'hello'), 'b.txt': ('file', 'world'), 'docs': {'c.txt': ('file', 'hello')}}, 'tmp': {'d.txt': ('file', 'world'), 'locked.txt': ('error', 'permission denied')}, 'var': {'e.log': ('changed', 'hello', 'hello v2'), 'f.txt': ('file', 'unique')}})",expected:"[['home/a.txt', 'home/docs/c.txt'], ['home/b.txt', 'tmp/d.txt']]"},{name:"triple group",call:"find_duplicates({'a': ('file', 'x'), 'b': ('file', 'x'), 'c': ('file', 'x')})",expected:"[['a', 'b', 'c']]"},{name:"no duplicates",call:"find_duplicates({'only': ('file', 'x'), 'bad': ('error', 'io')})",expected:"[]"},{name:"empty fs",call:"find_duplicates({})",expected:"[]"}]},crawler:{1:[{name:"same host only, fragments stripped",call:"sorted(crawl('http://news.site/', {'http://news.site/': ['http://news.site/a#top', 'http://evil.com/x', 'http://news.site/b'], 'http://news.site/a': ['http://news.site/', 'http://news.site/c'], 'http://news.site/b': ['http://news.site/c#frag', 'http://other.org/'], 'http://news.site/c': [], 'http://evil.com/x': ['http://news.site/hidden']}))",expected:"['http://news.site/', 'http://news.site/a', 'http://news.site/b', 'http://news.site/c']"},{name:"port makes a different host",call:"sorted(crawl('http://a.com/1', {'http://a.com/1': ['http://a.com/2'], 'http://a.com/2': ['http://a.com/1', 'http://a.com:80/3']}))",expected:"['http://a.com/1', 'http://a.com/2']"},{name:"single page",call:"sorted(crawl('http://solo.io/', {'http://solo.io/': []}))",expected:"['http://solo.io/']"}],2:[{name:"concurrent: same host only",call:"sorted(crawl_concurrent('http://news.site/', {'http://news.site/': ['http://news.site/a#top', 'http://evil.com/x', 'http://news.site/b'], 'http://news.site/a': ['http://news.site/', 'http://news.site/c'], 'http://news.site/b': ['http://news.site/c#frag', 'http://other.org/'], 'http://news.site/c': [], 'http://evil.com/x': ['http://news.site/hidden']}))",expected:"['http://news.site/', 'http://news.site/a', 'http://news.site/b', 'http://news.site/c']"},{name:"concurrent: cycles are safe",call:"sorted(crawl_concurrent('http://a.com/1', {'http://a.com/1': ['http://a.com/2'], 'http://a.com/2': ['http://a.com/1', 'http://a.com:80/3']}))",expected:"['http://a.com/1', 'http://a.com/2']"},{name:"concurrent: single page",call:"sorted(crawl_concurrent('http://solo.io/', {'http://solo.io/': []}))",expected:"['http://solo.io/']"}]},banking:{1:[{name:"create, deposit, transfer",setup:`b = BankingSystem()
r = (b.create_account(1, 'acc1'), b.create_account(2, 'acc1'), b.create_account(3, 'acc2'), b.deposit(4, 'acc1', 500), b.transfer(5, 'acc1', 'acc2', 200))`,call:"r",expected:"(True, False, True, 500, 300)"},{name:"transfer failure modes",setup:`b = BankingSystem()
b.create_account(1, 'a')
b.create_account(2, 'c')
b.deposit(3, 'a', 100)
r = (b.transfer(4, 'a', 'a', 10), b.transfer(5, 'a', 'ghost', 10), b.transfer(6, 'a', 'c', 101), b.transfer(7, 'a', 'c', 100), b.deposit(8, 'ghost', 5))`,call:"r",expected:"(None, None, None, 0, None)"}],2:[{name:"top spenders ranks outgoing",setup:`b = BankingSystem()
for i, a in enumerate(['a', 'b', 'c']):
    b.create_account(i + 1, a)
    b.deposit(i + 10, a, 1000)
b.transfer(20, 'a', 'b', 300)
b.transfer(21, 'c', 'a', 300)
b.transfer(22, 'b', 'a', 150)`,call:"b.top_spenders(23, 3)",expected:"['a(300)', 'c(300)', 'b(150)']"},{name:"tie broken alphabetically, n clips",setup:`b = BankingSystem()
for i, a in enumerate(['z', 'y']):
    b.create_account(i + 1, a)
    b.deposit(i + 10, a, 100)
b.transfer(20, 'z', 'y', 50)
b.transfer(21, 'y', 'z', 50)`,call:"b.top_spenders(22, 5)",expected:"['y(50)', 'z(50)']"}],3:[{name:"pay issues global ordinals",setup:`b = BankingSystem()
b.create_account(1, 'a')
b.create_account(2, 'c')
b.deposit(3, 'a', 1000)
b.deposit(4, 'c', 1000)
r = (b.pay(5, 'a', 300), b.pay(6, 'c', 100), b.pay(7, 'a', 9999), b.pay(8, 'ghost', 1))`,call:"r",expected:"('payment1', 'payment2', None, None)"},{name:"cashback lands after 24h",setup:`b = BankingSystem()
b.create_account(1, 'a')
b.deposit(2, 'a', 1000)
p = b.pay(3, 'a', 500)
s1 = b.get_payment_status(4, 'a', p)
bal_before = b.get_balance(5, 'a', 5)
s2 = b.get_payment_status(3 + 86400000, 'a', p)
bal_after = b.get_balance(4 + 86400000, 'a', 4 + 86400000)`,call:"(p, s1, bal_before, s2, bal_after)",expected:"('payment1', 'IN_PROGRESS', 500, 'CASHBACK_RECEIVED', 510)"},{name:"status needs the right account",setup:`b = BankingSystem()
b.create_account(1, 'a')
b.create_account(2, 'c')
b.deposit(3, 'a', 100)
p = b.pay(4, 'a', 50)
r = (b.get_payment_status(5, 'c', p), b.get_payment_status(6, 'a', 'payment9'), b.get_payment_status(7, 'a', p))`,call:"r",expected:"(None, None, 'IN_PROGRESS')"},{name:"pay counts toward top spenders",setup:`b = BankingSystem()
b.create_account(1, 'a')
b.create_account(2, 'c')
b.deposit(3, 'a', 500)
b.deposit(4, 'c', 500)
b.pay(5, 'a', 400)
b.transfer(6, 'c', 'a', 100)`,call:"b.top_spenders(7, 2)",expected:"['a(400)', 'c(100)']"}],4:[{name:"merge combines balances and spending",setup:`b = BankingSystem()
b.create_account(1, 'a')
b.create_account(2, 'c')
b.deposit(3, 'a', 300)
b.deposit(4, 'c', 200)
b.transfer(5, 'c', 'a', 50)
ok = b.merge_accounts(6, 'a', 'c')
r = (ok, b.merge_accounts(7, 'a', 'a'), b.merge_accounts(8, 'a', 'c'), b.deposit(9, 'c', 1), b.get_balance(10, 'a', 10))
spend = b.top_spenders(11, 5)`,call:"(r, spend)",expected:"((True, False, False, None, 500), ['a(50)'])"},{name:"historical balance",setup:`b = BankingSystem()
b.create_account(1, 'a')
b.deposit(5, 'a', 100)
b.deposit(10, 'a', 50)
r = (b.get_balance(11, 'a', 0), b.get_balance(12, 'a', 5), b.get_balance(13, 'a', 9), b.get_balance(14, 'a', 10), b.get_balance(15, 'ghost', 10))`,call:"r",expected:"(None, 100, 100, 150, None)"},{name:"merged-away account stops answering",setup:`b = BankingSystem()
b.create_account(1, 'a')
b.create_account(2, 'c')
b.deposit(3, 'c', 70)
b.merge_accounts(10, 'a', 'c')
r = (b.get_balance(11, 'c', 5), b.get_balance(12, 'c', 10), b.get_balance(13, 'a', 10))`,call:"r",expected:"(70, None, 70)"},{name:"pending cashback follows the merge",setup:`b = BankingSystem()
b.create_account(1, 'a')
b.create_account(2, 'c')
b.deposit(3, 'c', 1000)
p = b.pay(4, 'c', 500)
b.merge_accounts(5, 'a', 'c')
r = (b.get_payment_status(6, 'a', p), b.get_balance(10 + 86400000, 'a', 10 + 86400000))`,call:"r",expected:"('IN_PROGRESS', 510)"}]},recipes:{1:[{name:"crud with case-insensitive names",setup:`m = RecipeManager()
r = (m.add_recipe('r1', 'Pancakes', ['flour', 'egg']), m.add_recipe('r1', 'Waffles', ['flour']), m.add_recipe('r2', 'PANCAKES', ['flour']), m.get_recipe('r1'), m.get_recipe('nope'))`,call:"r",expected:"(True, False, False, {'id': 'r1', 'name': 'Pancakes', 'ingredients': ['flour', 'egg']}, None)"},{name:"update and delete",setup:`m = RecipeManager()
m.add_recipe('r1', 'Soup', ['water'])
m.add_recipe('r2', 'Stew', ['beef'])
r = (m.update_recipe('r1', 'SOUP', ['water', 'salt']), m.update_recipe('r1', 'stew', ['x']), m.get_recipe('r1'), m.delete_recipe('r2'), m.delete_recipe('r2'), m.add_recipe('r3', 'Stew', ['beef']))`,call:"r",expected:"(True, False, {'id': 'r1', 'name': 'SOUP', 'ingredients': ['water', 'salt']}, True, False, True)"}],2:[{name:"search sorts by ingredient count",setup:`m = RecipeManager()
m.add_recipe('b', 'Apple pie', ['apple', 'flour', 'sugar'])
m.add_recipe('a', 'apple juice', ['apple'])
m.add_recipe('c', 'Banana bread', ['banana', 'flour'])`,call:"(m.search_recipes('apple'), m.search_recipes('APPLE'), m.search_recipes('zzz'), m.list_recipes())",expected:"(['a', 'b'], ['a', 'b'], [], ['a', 'c', 'b'])"},{name:"tie broken by recipe id",setup:`m = RecipeManager()
m.add_recipe('z', 'Tea', ['water'])
m.add_recipe('a', 'Coffee', ['beans'])`,call:"m.list_recipes()",expected:"['a', 'z']"}],3:[{name:"ownership and grants",setup:`m = RecipeManager()
m.add_user('mari', 'Mari')
m.add_user('ada', 'Ada')
m.add_recipe('r1', 'Cake', ['flour'], 'mari')
r = (m.add_recipe('r2', 'Pie', ['fruit'], 'ghost'), m.edit_recipe('ada', 'r1', 'Cakes', ['flour']), m.grant_editor('ada', 'r1', 'ada'), m.grant_editor('mari', 'r1', 'ada'), m.edit_recipe('ada', 'r1', 'Cakes', ['flour', 'love']), m.get_recipe('r1'))`,call:"r",expected:"(False, False, False, True, True, {'id': 'r1', 'name': 'Cakes', 'ingredients': ['flour', 'love']})"},{name:"only the owner deletes",setup:`m = RecipeManager()
m.add_user('mari', 'Mari')
m.add_user('ada', 'Ada')
m.add_recipe('r1', 'Cake', ['flour'], 'mari')
m.grant_editor('mari', 'r1', 'ada')
r = (m.delete_recipe_as('ada', 'r1'), m.delete_recipe_as('mari', 'r1'), m.get_recipe('r1'))`,call:"r",expected:"(False, True, None)"}],4:[{name:"history records every version",setup:`m = RecipeManager()
m.add_recipe('r1', 'Tea', ['water'])
m.update_recipe('r1', 'Green tea', ['water', 'leaves'])
m.update_recipe('r1', 'Matcha', ['water', 'matcha'])`,call:"m.get_recipe_history('r1')",expected:"[{'version': 1, 'name': 'Tea', 'ingredients': ['water']}, {'version': 2, 'name': 'Green tea', 'ingredients': ['water', 'leaves']}, {'version': 3, 'name': 'Matcha', 'ingredients': ['water', 'matcha']}]"},{name:"rollback appends a new version",setup:`m = RecipeManager()
m.add_recipe('r1', 'Tea', ['water'])
m.update_recipe('r1', 'Matcha', ['water', 'matcha'])
ok = m.rollback_recipe('admin', 'r1', 1)
r = (ok, m.get_recipe('r1'), [v['version'] for v in m.get_recipe_history('r1')], m.rollback_recipe('admin', 'r1', 99))`,call:"r",expected:"(True, {'id': 'r1', 'name': 'Tea', 'ingredients': ['water']}, [1, 2, 3], False)"},{name:"rollback blocked by a name collision",setup:`m = RecipeManager()
m.add_recipe('r1', 'Tea', ['water'])
m.update_recipe('r1', 'Matcha', ['water'])
m.add_recipe('r2', 'tea', ['water'])
r = (m.rollback_recipe('admin', 'r1', 1), m.get_recipe('r1'))`,call:"r",expected:"(False, {'id': 'r1', 'name': 'Matcha', 'ingredients': ['water']})"}]},tasks:{1:[{name:"sequential ids and crud",setup:`m = TaskManager()
t1 = m.add_task(1, 'write tests', 5)
t2 = m.add_task(2, 'fix bug', 9)
r = (t1, t2, m.get_task(3, t1), m.update_task(4, t1, 'write more tests', 7), m.get_task(5, t1), m.update_task(6, 'task_id_99', 'x', 1), m.get_task(7, 'task_id_99'))`,call:"r",expected:"('task_id_1', 'task_id_2', {'name': 'write tests', 'priority': 5}, True, {'name': 'write more tests', 'priority': 7}, False, None)"}],2:[{name:"search sorts by priority then creation",setup:`m = TaskManager()
m.add_task(1, 'deploy api', 3)
m.add_task(2, 'deploy web', 8)
m.add_task(3, 'deploy docs', 8)
m.add_task(4, 'write docs', 1)`,call:"(m.search_tasks(5, 'deploy', 10), m.search_tasks(6, 'deploy', 2), m.search_tasks(7, 'deploy', 0), m.list_tasks_sorted(8, 3))",expected:"(['task_id_2', 'task_id_3', 'task_id_1'], ['task_id_2', 'task_id_3'], [], ['task_id_2', 'task_id_3', 'task_id_1'])"}],3:[{name:"quota counts active assignments",setup:`m = TaskManager()
t1 = m.add_task(1, 'a', 1)
t2 = m.add_task(2, 'b', 2)
t3 = m.add_task(3, 'c', 3)
m.add_user(4, 'mari', 2)
r = (m.assign_task(5, t1, 'mari', 100), m.assign_task(6, t2, 'mari', 50), m.assign_task(7, t3, 'mari', 200), m.assign_task(60, t3, 'mari', 200), m.get_user_tasks(61, 'mari'))`,call:"r",expected:"(True, True, False, True, ['task_id_1', 'task_id_3'])"},{name:"assign failure modes",setup:`m = TaskManager()
t1 = m.add_task(1, 'a', 1)
m.add_user(2, 'mari', 1)
r = (m.assign_task(3, 'task_id_9', 'mari', 10), m.assign_task(4, t1, 'ghost', 10), m.add_user(5, 'mari', 3))`,call:"r",expected:"(False, False, False)"}],4:[{name:"complete and overdue",setup:`m = TaskManager()
t1 = m.add_task(1, 'a', 1)
t2 = m.add_task(2, 'b', 2)
m.add_user(3, 'mari', 5)
m.assign_task(4, t1, 'mari', 10)
m.assign_task(5, t2, 'mari', 8)
r1 = m.get_overdue_assignments(9, 'mari')
ok = m.complete_task(11, t2, 'mari')
r2 = m.get_overdue_assignments(12, 'mari')
r3 = (m.complete_task(13, t2, 'mari'), m.complete_task(14, 'task_id_9', 'mari'))`,call:"(r1, ok, r2, r3)",expected:"(['task_id_2'], True, ['task_id_1'], (False, False))"}]},workers:{1:[{name:"clock in and out",call:'solution([["ADD_WORKER", "ashley", "dev", "100"], ["ADD_WORKER", "ashley", "dev", "100"], ["REGISTER", "ashley", "10"], ["REGISTER", "ashley", "25"], ["GET", "ashley"], ["REGISTER", "ashley", "30"], ["GET", "ashley"], ["REGISTER", "ghost", "5"], ["GET", "ghost"]])',expected:"['true', 'false', 'registered', 'registered', '15', 'registered', '15', 'invalid_request', '']"}],2:[{name:"top n by position",call:'solution([["ADD_WORKER", "a", "dev", "10"], ["ADD_WORKER", "b", "dev", "10"], ["ADD_WORKER", "c", "qa", "10"], ["REGISTER", "a", "0"], ["REGISTER", "a", "50"], ["REGISTER", "b", "0"], ["REGISTER", "b", "50"], ["TOP_N_WORKERS", "2", "dev"], ["TOP_N_WORKERS", "1", "qa"], ["TOP_N_WORKERS", "3", "boss"]])',expected:"['true', 'true', 'true', 'registered', 'registered', 'registered', 'registered', 'a(50), b(50)', 'c(0)', '']"}],3:[{name:"promotion applies at next clock-in",call:'solution([["ADD_WORKER", "a", "junior", "10"], ["REGISTER", "a", "0"], ["REGISTER", "a", "100"], ["PROMOTE", "a", "senior", "20", "150"], ["PROMOTE", "a", "lead", "30", "160"], ["REGISTER", "a", "110"], ["REGISTER", "a", "120"], ["REGISTER", "a", "200"], ["REGISTER", "a", "300"], ["TOP_N_WORKERS", "1", "senior"], ["CALC_SALARY", "a", "0", "300"], ["CALC_SALARY", "ghost", "0", "1"]])',expected:"['true', 'registered', 'registered', 'success', 'invalid_request', 'registered', 'registered', 'registered', 'registered', 'a(210)', '3100', '']"}],4:[{name:"double-paid periods union",call:'solution([["ADD_WORKER", "w", "dev", "10"], ["REGISTER", "w", "0"], ["REGISTER", "w", "40"], ["SET_DOUBLE_PAID", "5", "25"], ["SET_DOUBLE_PAID", "20", "35"], ["CALC_SALARY", "w", "0", "40"], ["CALC_SALARY", "w", "0", "10"]])',expected:"['true', 'registered', 'registered', 'success', 'success', '700', '150']"}]},notes:{1:[{name:"crud basics",setup:`s = NoteSystem()
r = (s.create_note(1, 'n1', 'Groceries', 'milk, eggs'), s.create_note(2, 'n1', 'Dup', 'x'), s.get_note(3, 'n1'), s.update_note(4, 'n1', 'Groceries', 'milk, eggs, tofu'), s.get_note(5, 'n1'), s.delete_note(6, 'n1'), s.get_note(7, 'n1'), s.update_note(8, 'n1', 'x', 'y'))`,call:"r",expected:"(True, False, {'id': 'n1', 'title': 'Groceries', 'body': 'milk, eggs'}, True, {'id': 'n1', 'title': 'Groceries', 'body': 'milk, eggs, tofu'}, True, None, False)"}],2:[{name:"search title+body, recent first",setup:`s = NoteSystem()
s.create_note(1, 'a', 'UKIEPC plan', 'practice graphs')
s.create_note(2, 'b', 'Shopping', 'buy graph paper')
s.create_note(3, 'c', 'Diary', 'nothing here')
s.update_note(4, 'a', 'UKIEPC plan', 'practice graphs and dp')`,call:"(s.search_notes(5, 'graph'), s.search_notes(6, 'GRAPH'), s.search_notes(7, 'zzz'))",expected:"(['a', 'b'], ['a', 'b'], [])"}],3:[{name:"ttl expiry frees the id",setup:`s = NoteSystem()
s.create_note(1, 'tmp', 'Temp', 'gone soon', ttl=10)
r = (s.get_note(5, 'tmp'), s.get_note(11, 'tmp'), s.search_notes(12, 'temp'), s.create_note(13, 'tmp', 'Reborn', 'new life'), s.get_note(14, 'tmp'))`,call:"r",expected:"({'id': 'tmp', 'title': 'Temp', 'body': 'gone soon'}, None, [], True, {'id': 'tmp', 'title': 'Reborn', 'body': 'new life'})"}],4:[{name:"time-travel reads",setup:`s = NoteSystem()
s.create_note(1, 'n', 'v1', 'first')
s.update_note(10, 'n', 'v2', 'second')
s.update_note(20, 'n', 'v3', 'third')
r = (s.get_note_at(30, 'n', 0), s.get_note_at(31, 'n', 1), s.get_note_at(32, 'n', 15), s.get_note_at(33, 'n', 99))`,call:"r",expected:"(None, {'id': 'n', 'title': 'v1', 'body': 'first'}, {'id': 'n', 'title': 'v2', 'body': 'second'}, {'id': 'n', 'title': 'v3', 'body': 'third'})"}]}},Q={oa:"Online assessment (CodeSignal ICA)",screening:"Technical screen (~1h, Colab)",onsite:"Onsite coding (~55 min)"},a=(e,s)=>{var p;return((p=ge[e])==null?void 0:p[s])??[]},M='Implement `solution(queries)`. Each query is a list of strings — an operation name\nfollowed by its arguments. Return a list with one result string per query (`""` when the\noperation has no output). Numbers arrive as strings and are returned as strings.',T=[{id:"imdb",title:"In-memory Database with Backup",stage:"oa",difficulty:"hard",reported:!0,timerMinutes:90,starterCode:`def solution(queries):
    # queries: list[list[str]] -> list[str]
    results = []
    for q in queries:
        op = q[0]
        # TODO
        results.append("")
    return results
`,levels:[{title:"Level 1 — records, fields, values",spec:`${M}

The database holds **records** (by key), each a set of **fields** with string values.

| operation | returns |
|---|---|
| \`SET key field value\` | \`""\` — creates or overwrites the field |
| \`GET key field\` | the value, or \`""\` if the record or field doesn't exist |
| \`DELETE key field\` | \`"true"\` if the field existed and was removed, else \`"false"\` |
`,tests:a("imdb",1)},{title:"Level 2 — scanning",spec:'All level 1 operations still work (they\'re re-run as regression tests).\n\n| operation | returns |\n|---|---|\n| `SCAN key` | all fields of the record as `"f1(v1), f2(v2)"`, fields sorted lexicographically; `""` if no record |\n| `SCAN_BY_PREFIX key prefix` | same, but only fields starting with `prefix` |\n',tests:a("imdb",2)},{title:"Level 3 — timestamps and TTL",spec:'Operations now carry an integer **timestamp** (non-decreasing across a test). A field set\nwith a TTL exists for `t` in `[timestamp, timestamp + ttl)` — at expiry it\'s gone.\nPlain `SET_AT` (no TTL) never expires, and overwriting a field replaces its TTL.\nTimestamped and plain operations are never mixed within one test.\n\n| operation | returns |\n|---|---|\n| `SET_AT key field value timestamp` | `""` |\n| `SET_AT_WITH_TTL key field value timestamp ttl` | `""` |\n| `DELETE_AT key field timestamp` | `"true"` / `"false"` (an expired field counts as absent) |\n| `GET_AT key field timestamp` | value or `""` |\n| `SCAN_AT key timestamp` | like `SCAN`, only unexpired fields |\n| `SCAN_BY_PREFIX_AT key prefix timestamp` | like `SCAN_BY_PREFIX` |\n',tests:a("imdb",3)},{title:"Level 4 — backup and restore",spec:'| operation | returns |\n|---|---|\n| `BACKUP timestamp` | number of non-empty records saved, as a string |\n| `RESTORE timestamp restoreTimestamp` | `""` |\n\n`RESTORE` replaces the whole database with the **latest backup taken at or before**\n`restoreTimestamp`. TTLs are recalculated: a field that had `r` seconds of life left when\nthe backup was taken expires at `timestamp + r` after the restore. Fields without TTL stay\npermanent. If no backup qualifies, the database becomes empty.\n',tests:a("imdb",4)}]},{id:"storage",title:"Cloud Storage System",stage:"oa",difficulty:"hard",reported:!0,timerMinutes:90,starterCode:`def solution(queries):
    # queries: list[list[str]] -> list[str]
    results = []
    for q in queries:
        op = q[0]
        # TODO
        results.append("")
    return results
`,levels:[{title:"Level 1 — files",spec:`${M}

| operation | returns |
|---|---|
| \`ADD_FILE name size\` | \`"true"\` if added, \`"false"\` if a file with that name exists |
| \`GET_FILE_SIZE name\` | the size, or \`""\` if missing |
| \`DELETE_FILE name\` | the deleted file's size, or \`""\` if missing |
`,tests:a("storage",1)},{title:"Level 2 — largest files by prefix",spec:'| operation | returns |\n|---|---|\n| `GET_N_LARGEST prefix n` | up to `n` files whose **name** starts with `prefix`, as `"name1(size1), name2(size2)"` — sorted by size descending, ties by name ascending; `""` if none match |\n',tests:a("storage",2)},{title:"Level 3 — users and capacity",spec:'Files added with `ADD_FILE` belong to an `admin` user with unlimited capacity.\n\n| operation | returns |\n|---|---|\n| `ADD_USER userId capacity` | `"true"` if created, `"false"` if the user exists |\n| `ADD_FILE_BY userId name size` | the user\'s **remaining capacity** after adding, or `""` if the user doesn\'t exist, the file name is taken, or it would exceed capacity |\n| `UPDATE_CAPACITY userId capacity` | number of files removed to fit the new capacity, as a string; the user\'s **largest** files are removed first (ties by name ascending); `""` if no such user |\n\n`DELETE_FILE` frees the owner\'s capacity.\n',tests:a("storage",3)},{title:"Level 4 — compression",spec:'Sizes are always even.\n\n| operation | returns |\n|---|---|\n| `COMPRESS_FILE userId name` | renames the file to `name + ".COMPRESSED"` and halves its size; returns the user\'s remaining capacity, or `""` if the file doesn\'t exist, belongs to someone else, or is already compressed |\n| `DECOMPRESS_FILE userId name` | reverses it (pass the `.COMPRESSED` name); fails with `""` if the original name is taken, the user lacks capacity for the doubled size, it isn\'t compressed, or ownership doesn\'t match |\n',tests:a("storage",4)}]},{id:"banking",title:"Design Banking System",stage:"oa",difficulty:"hard",reported:!0,timerMinutes:90,starterCode:`class BankingSystem:
    def __init__(self):
        ...

    def create_account(self, timestamp, account_id):
        ...

    def deposit(self, timestamp, account_id, amount):
        ...

    def transfer(self, timestamp, source_id, target_id, amount):
        ...
`,levels:[{title:"Level 1 — accounts, deposits, transfers",spec:"This OA uses **method style**: implement the class, every method takes a `timestamp`\n(ms, strictly increasing across all calls in a test).\n\n- `create_account(timestamp, account_id) -> bool` — `False` if the id exists\n- `deposit(timestamp, account_id, amount) -> int | None` — new balance; `None` if no account\n- `transfer(timestamp, source_id, target_id, amount) -> int | None` — the **source's**\n  balance after the transfer; `None` if either account is missing, source equals target, or\n  funds are insufficient\n",tests:a("banking",1)},{title:"Level 2 — top spenders",spec:`- \`top_spenders(timestamp, n) -> list[str]\` — accounts formatted \`"id(total_outgoing)"\`,
  ranked by total outgoing money (transfers out; later also payments) **descending**, ties by
  id **ascending**. Fewer than n accounts → return them all. Deposits and incoming money
  never count; cashback refunds (level 3) don't reduce outgoing.
`,tests:a("banking",2)},{title:"Level 3 — payments with cashback",spec:'- `pay(timestamp, account_id, amount) -> str | None` — withdraws the amount and returns\n  `"payment1"`, `"payment2"`, … (the ordinal is **global across all accounts**); `None` if\n  the account is missing or funds are insufficient\n- 2% cashback — `amount * 2 // 100` — is refunded to the account at exactly\n  `timestamp + 86400000` (24h in ms). A cashback that falls due at time T must be applied\n  **before** any operation processed at T.\n- `get_payment_status(timestamp, account_id, payment) -> str | None` — `"IN_PROGRESS"`\n  until the cashback lands, then `"CASHBACK_RECEIVED"`; `None` if the account or payment is\n  unknown or the payment belongs to a different account\n- `pay` amounts count toward `top_spenders`\n',tests:a("banking",3)},{title:"Level 4 — merge and time travel",spec:"- `merge_accounts(timestamp, account_id_1, account_id_2) -> bool` — merges account 2\n  **into** account 1; `False` if the ids are equal or either is missing. Balances and\n  outgoing totals are summed, account 2's pending cashbacks will refund to account 1, its\n  payments become queryable under account 1 (and `None` under account 2), and account 2\n  disappears.\n- `get_balance(timestamp, account_id, time_at) -> int | None` — the balance **after** all\n  operations at `time_at` were processed; `None` if the account didn't exist yet at\n  `time_at` or had already been merged away. Cashbacks show up in history at their refund\n  time.\n",tests:a("banking",4)}]},{id:"recipes",title:"Design Recipe Management System",stage:"oa",difficulty:"medium",reported:!0,timerMinutes:90,starterCode:`class RecipeManager:
    def __init__(self):
        ...

    def add_recipe(self, recipe_id, name, ingredients, owner_id="admin"):
        ...

    def get_recipe(self, recipe_id):
        ...
`,levels:[{title:"Level 1 — CRUD with unique names",spec:'Method style. Recipe **names are globally unique case-insensitively** (stored and\nreturned with their original casing).\n\n- `add_recipe(recipe_id, name, ingredients, owner_id="admin") -> bool` — `False` if the id\n  is taken or the name collides (ignore `owner_id` until level 3; `"admin"` always exists)\n- `get_recipe(recipe_id) -> {"id", "name", "ingredients"} | None`\n- `update_recipe(recipe_id, name, ingredients) -> bool` — re-casing a recipe\'s **own** name\n  is not a collision\n- `delete_recipe(recipe_id) -> bool` — frees both the id and the name\n',tests:a("recipes",1)},{title:"Level 2 — listing and search",spec:"- `search_recipes(query) -> list[str]` — ids of recipes whose **name** contains `query`\n  case-insensitively\n- `list_recipes() -> list[str]` — all ids\n\nBoth sorted by **ingredient count ascending**, ties by recipe id ascending. (Candidate\nreports disagree on this tie-break — some say creation order — so ask in a real interview.)\n",tests:a("recipes",2)},{title:"Level 3 — users and permissions",spec:"- `add_user(user_id, username) -> bool` — `False` if the id exists\n- `add_recipe(..., owner_id)` now fails for unregistered owners\n- `grant_editor(owner_id, recipe_id, user_id) -> bool` — only the owner grants, and only to\n  registered users\n- `edit_recipe(user_id, recipe_id, name, ingredients) -> bool` — owner or granted editor\n- `delete_recipe_as(user_id, recipe_id) -> bool` — **owner only**\n",tests:a("recipes",3)},{title:"Level 4 — version history and rollback",spec:`Every successful add is version 1 and every successful update/edit appends a version.

- \`get_recipe_history(recipe_id) -> list[{"version", "name", "ingredients"}] | None\`
- \`rollback_recipe(user_id, recipe_id, version) -> bool\` — copies that old version as a
  **new** version (numbers are never reused); same permissions as editing; fails if the
  version doesn't exist or that old name now belongs to another recipe
`,tests:a("recipes",4)}]},{id:"tasks",title:"Design a Task Assignment System",stage:"oa",difficulty:"hard",reported:!0,timerMinutes:90,starterCode:`class TaskManager:
    def __init__(self):
        ...

    def add_task(self, timestamp, name, priority):
        ...
`,levels:[{title:"Level 1 — tasks with generated ids",spec:'Method style; every method takes a `timestamp` (increasing).\n\n- `add_task(timestamp, name, priority) -> str` — returns `"task_id_1"`, `"task_id_2"`, …\n  (one global counter)\n- `update_task(timestamp, task_id, name, priority) -> bool`\n- `get_task(timestamp, task_id) -> {"name", "priority"} | None`\n\n(The reported return shape for `get_task` varies between reports; this version uses a dict.)\n',tests:a("tasks",1)},{title:"Level 2 — search and ordering",spec:"- `search_tasks(timestamp, name_filter, max_results) -> list[str]` — ids of tasks whose\n  name contains `name_filter` (plain substring), sorted by **priority descending**, ties by\n  **creation order ascending**, truncated to `max_results`; `[]` when `max_results <= 0`\n- `list_tasks_sorted(timestamp, limit) -> list[str]` — same ordering over all tasks\n",tests:a("tasks",2)},{title:"Level 3 — users, quotas, assignments",spec:"- `add_user(timestamp, user_id, quota) -> bool`\n- `assign_task(timestamp, task_id, user_id, finish_time) -> bool` — fails if the task or\n  user is unknown, or the user's count of assignments **active right now**\n  (`start <= now < finish`, not completed) has reached their quota\n- `get_user_tasks(timestamp, user_id) -> list[str]` — task ids of currently active\n  assignments, sorted by `(finish_time, start_time)`\n",tests:a("tasks",3)},{title:"Level 4 — completion and overdue work",spec:"- `complete_task(timestamp, task_id, user_id) -> bool` — completes that user's\n  uncompleted assignment of the task; `False` if there is none\n- `get_overdue_assignments(timestamp, user_id) -> list[str]` — ids of uncompleted\n  assignments with `finish_time <= now`, sorted by `(finish_time, start_time)`\n",tests:a("tasks",4)}]},{id:"notes",title:"Design Note-Taking System",stage:"oa",difficulty:"medium",reported:!1,timerMinutes:90,starterCode:`class NoteSystem:
    def __init__(self):
        ...

    def create_note(self, timestamp, note_id, title, body, ttl=None):
        ...
`,levels:[{title:"Level 1 — notes CRUD",spec:'**Heads-up**: this title appears in the Anthropic question banks but no public spec\nexists — this version is built from the recurring ICA template (CRUD → search → TTL →\ntime-travel) so the *shape* of the practice is right.\n\nMethod style; every method takes a `timestamp` (increasing).\n\n- `create_note(timestamp, note_id, title, body, ttl=None) -> bool` — `False` if a live note\n  has the id\n- `get_note(timestamp, note_id) -> {"id", "title", "body"} | None`\n- `update_note(timestamp, note_id, title, body) -> bool`\n- `delete_note(timestamp, note_id) -> bool`\n',tests:a("notes",1)},{title:"Level 2 — search",spec:"- `search_notes(timestamp, query) -> list[str]` — ids of notes whose **title or body**\n  contains `query` case-insensitively, most recently **updated** first, ties by id ascending\n",tests:a("notes",2)},{title:"Level 3 — expiring notes",spec:"`create_note`'s optional `ttl` makes the note exist for `t` in\n`[timestamp, timestamp + ttl)`. An expired note is absent everywhere — reads, updates,\ndeletes, search — and its id can be reused.\n",tests:a("notes",3)},{title:"Level 4 — time travel",spec:'- `get_note_at(timestamp, note_id, time_at) -> {"id", "title", "body"} | None` — the\n  note\'s content as it stood at `time_at` (after all updates at that instant); `None`\n  before creation or at/after expiry\n',tests:a("notes",4)}]},{id:"workers",title:"Design Worker Management System",stage:"oa",difficulty:"medium",reported:!0,timerMinutes:90,starterCode:`def solution(queries):
    # queries: list[list[str]] -> list[str]
    results = []
    for q in queries:
        op = q[0]
        # TODO
        results.append("")
    return results
`,levels:[{title:"Level 1 — clock in, clock out",spec:`${M}

| operation | returns |
|---|---|
| \`ADD_WORKER workerId position compensation\` | \`"true"\`, or \`"false"\` if the id exists |
| \`REGISTER workerId timestamp\` | \`"registered"\`, or \`"invalid_request"\` for an unknown worker — calls alternate clock-in / clock-out; timestamps arrive increasing |
| \`GET workerId\` | total time in the office counting **finished sessions only**, or \`""\` for an unknown worker |
`,tests:a("workers",1)},{title:"Level 2 — top workers by position",spec:'| operation | returns |\n|---|---|\n| `TOP_N_WORKERS n position` | `"id1(time1), id2(time2)"` — workers whose **current** position matches, sorted by total finished time descending, ties by id ascending; workers with no finished session count as 0 and are included; `""` if nobody holds the position |\n',tests:a("workers",2)},{title:"Level 3 — promotions and salary",spec:'| operation | returns |\n|---|---|\n| `PROMOTE workerId newPosition newCompensation startTimestamp` | `"success"`, or `"invalid_request"` if the worker is unknown or an unapplied promotion is already pending |\n| `CALC_SALARY workerId startTimestamp endTimestamp` | total salary in the half-open interval `[start, end)`, or `""` for an unknown worker |\n\nA promotion takes effect at the worker\'s first **clock-in** at or after `startTimestamp`.\n`TOP_N_WORKERS` uses the current position; `GET` still counts time across all positions.\nSalary: for each finished session, `overlap_with_the_interval × compensation`, where the\ncompensation is the one in effect **at that session\'s clock-in**.\n',tests:a("workers",3)},{title:"Level 4 — double-paid periods",spec:'| operation | returns |\n|---|---|\n| `SET_DOUBLE_PAID startTimestamp endTimestamp` | `"success"` — adds a company-wide double-pay interval `[start, end)` |\n\nOverlapping double-pay intervals must be **unioned** — time is doubled, never tripled. The\ndoubled portion of a session adds one extra compensation rate on top of normal pay:\nrate 10, session `[0, 40)`, double-paid `[5, 25)` and `[20, 35)` → union `[5, 35)` →\n`40×10 + 30×10 = 700`. `CALC_SALARY` clips everything to its query interval.\n',tests:a("workers",4)}]},{id:"tokenizer",title:"String Tokenization",stage:"screening",difficulty:"medium",reported:!0,timerMinutes:60,starterCode:`def longest_match_tokenize(text, vocab):
    # -> list[int]  (token ids = index into vocab)
    ...


def tokenize_with_unknowns(text, vocab):  # level 2
    # -> list[tuple[int, str]]
    ...
`,levels:[{title:"Level 1 — greedy longest match",spec:'Implement `longest_match_tokenize(text, vocab) -> list[int]`.\n\nA token\'s **id is its index in `vocab`**. Starting at position 0, repeatedly take the\n**longest** vocab string that matches at the current position, emit its id, and advance past\nit. Purely greedy — no backtracking, case-sensitive, spaces and punctuation are ordinary\ncharacters. Every single character of `text` is guaranteed to be in `vocab`, so you can\nnever get stuck.\n\nExample: `text="abcab"`, `vocab=["a","b","c","ab","abc"]` → `[4, 3]` (`"abc"` then `"ab"`).\n\nConstraints worth designing for: `len(text) ≤ 1e5`, `len(vocab) ≤ 1e4`, vocab strings up to\n50 chars. (A dict of vocab bucketed by first character, or a trie, beats scanning the whole\nvocab at every position — the interviewer will ask.)\n',tests:a("tokenizer",1)},{title:"Level 2 — unknown characters",spec:'Implement `tokenize_with_unknowns(text, vocab) -> list[tuple[int, str]]`.\n\nSame greedy rule, but now the single-character guarantee is gone. Emit `(id, matched_text)`\nfor known tokens. Characters that match nothing are **coalesced into runs** and emitted as\none `(-1, run)` tuple per maximal run.\n\nExample: `"hi!?yo"` with `vocab=["hi","yo","h"]` → `[(0, "hi"), (-1, "!?"), (1, "yo")]`.\n',tests:a("tokenizer",2)}]},{id:"crawler",title:"Concurrent Web Crawler",stage:"screening",difficulty:"medium",reported:!0,timerMinutes:60,starterCode:`def crawl(start_url, web):
    # web.get(url, []) -> outgoing links. Return sorted list of visited urls.
    ...


def crawl_concurrent(start_url, web, max_workers=8):  # level 2
    import threading
    ...
`,levels:[{title:"Level 1 — single-threaded crawl",spec:"Implement `crawl(start_url, web) -> list[str]` where `web.get(url, [])` returns a page's\noutgoing links (a stand-in for a slow black-box `HtmlParser.getUrls`).\n\nRules (exactly as reported):\n- Only follow links on the **same hostname** as the start URL — the part between `//` and the\n  next `/`. **No other normalization**: `http://a.com`, `http://a.com/` and `http://a.com:80`\n  are three different pages.\n- **Strip the fragment** (`#...`) from every URL before dedup and output.\n- The graph has cycles — never fetch the same sanitized URL twice.\n- Return the visited URLs **sorted lexicographically**.\n",tests:a("crawler",1)},{title:"Level 2 — make it concurrent",spec:"> ⚠️ **This level cannot run on the in-browser (pyodide/WASM) engine** — WASM Python\n> can't start threads, so `Thread.start()` raises `RuntimeError`. Start the local backend\n> (`scripts/.venv-interview/bin/python scripts/interview_server.py`) to run it for real.\n\nImplement `crawl_concurrent(start_url, web, max_workers=8)` with real threads\n(`threading` / `concurrent.futures`). Same results as level 1 — the tests check\ncorrectness; the concurrency discipline is the point:\n\n- mark a URL as visited **before** handing it to a worker, not after the fetch returns\n- a thread-safe frontier (e.g. `queue.Queue`) and a lock around the visited set\n- termination: how do you know the crawl is done? (track in-flight work — `Queue.join`,\n  or a counter under the lock)\n\nIn the real screen you'd be asked to talk through worker-pool sizing and what breaks\nwithout the lock. Practice saying it out loud.\n",tests:a("crawler",2)}]},{id:"cluster",title:"Find Cluster Mode and Median",stage:"screening",difficulty:"hard",reported:!0,timerMinutes:60,starterCode:`def cluster_stats(partitions):
    # -> (mode, median)
    ...


def plan_aggregation(partitions, value_range=None):  # level 2
    # -> (mode, median, strategy, bytes_sent, read_seconds, network_seconds, total_seconds)
    ...
`,levels:[{title:"Level 1 — exact mode and median",spec:`A cluster of worker nodes each holds a partition of integers. Implement
\`cluster_stats(partitions) -> (mode, median)\` over **all** values:

- **mode**: most frequent value; ties go to the **smallest** value
- **median**: for an even count, the average of the two middle values — an \`int\` when it's
  whole, otherwise a float
- empty cluster → \`(None, None)\`
`,tests:a("cluster",1)},{title:"Level 2 — minimize bytes over the wire",spec:'The real question: reading local data costs **10 bytes/sec** per worker (in parallel),\nthe network moves **1 byte/sec** (total), so bytes sent dominate. Implement\n`plan_aggregation(partitions, value_range=None)` returning the tuple\n`(mode, median, strategy, bytes_sent, read_seconds, network_seconds, total_seconds)`.\n\nEach worker can send its data one of three ways:\n- `"raw"` — 4 bytes per integer\n- `"sparse_counts"` — 8 bytes per **distinct value on that worker** (value, count pairs)\n- `"dense_histogram"` — 4 bytes per bucket per worker, buckets = `hi - lo + 1`; only\n  allowed when `value_range=(lo, hi)` is given **and** every value fits in it\n\nPick the cheapest total; break ties dense > sparse > raw. Costs:\n`read_seconds = 4 × (largest partition length) / 10` (reads are parallel),\n`network_seconds = bytes_sent / 1`, `total = read + network`.\n\nWorked example from the reports: `[[1,1,1,1,2,2],[2,2,2,3,3,3],[1,1,3,3,3,3]]` with range\n`(1,3)` → `(3, 2, "dense_histogram", 36, 2.4, 36.0, 38.4)`.\n\nBe ready to discuss: skewed vs uniform data, unknown value ranges, tree vs star aggregation,\nand when naive gather is actually optimal.\n',tests:a("cluster",2)}]},{id:"dupfiles",title:"Find Duplicate Files",stage:"screening",difficulty:"hard",reported:!0,timerMinutes:60,starterCode:`def find_duplicates(fs):
    # fs: nested dict. dir = dict; file = ("file", content);
    # unreadable = ("error", reason); changed mid-scan = ("changed", old, new)
    ...
`,levels:[{title:"Level 1 — the full variant",spec:'A filesystem is a nested dict: a **directory** is a dict, a **file** is `("file", content)`,\nan **unreadable file** is `("error", reason)` and a file that **changed during the scan** is\n`("changed", old_content, new_content)`. Implement `find_duplicates(fs)`:\n\n- return groups (lists) of `/`-joined relative paths whose contents are identical\n- only groups of **2+** files; each group sorted lexicographically; groups sorted by their\n  first path\n- skip `error` files entirely; `changed` files may be used for cheap size-grouping\n  (`len(old)`) but must be **skipped at the hashing stage** — so they never appear in output\n\nThe expected pipeline (the interviewer walks you through it): recursive scan → group by\n**size** (a unique size can\'t be a duplicate) → hash same-size candidates (chunked SHA-256,\nnot whole-file reads) → group by hash. Follow-ups to rehearse: I/O-bound or CPU-bound?\nbillions of files? parallelize which stage? near-realtime detection?\n',tests:a("dupfiles",1)}]},{id:"profiling",title:"Generate Function Profiling Events",stage:"screening",difficulty:"hard",reported:!0,timerMinutes:60,starterCode:`def samples_to_trace(samples):
    # samples: list[(timestamp, stack)] with stack[0] outermost
    # -> list[(timestamp, "START"|"END", name)]
    ...


def profile_events(samples, n):  # level 2: debounce threshold n
    ...
`,levels:[{title:"Level 1 — stack samples to trace events",spec:'A sampling profiler produced chronological samples `(timestamp, stack)` where\n`stack[0]` is the outermost frame. Implement `samples_to_trace(samples)` returning\n`(timestamp, "START"|"END", name)` events that reconstruct the execution trace:\n\n- diff each sample against the previous one by **longest common prefix**: close the dropped\n  frames (innermost first), then open the added frames (outermost first), all at the new\n  sample\'s timestamp\n- a frame\'s identity is its **position**: `["f", "f"]` is `f` calling `f`\n- identical consecutive samples emit nothing\n- after the last sample, close every open frame **at the last timestamp**\n',tests:a("profiling",1)},{title:"Level 2 — debounce threshold",spec:"Samples are noisy. Implement `profile_events(samples, n)`:\n\n- a frame **STARTs** once it has appeared in `n` consecutive samples — the event's timestamp\n  is the **first** sample of that run\n- a frame **ENDs** once absent for `n` consecutive samples — timestamp of the first absence\n- shorter runs emit nothing and reset the opposing counter; churn **below** a frame doesn't\n  reset it; a frame can't outlive its ancestor\n- within one timestamp: ENDs deepest-first, then STARTs outermost-first\n- still-open frames flush an END at the last timestamp; `n=1` reduces to level 1\n\nExample (`n=2`): `(10,[A,B]) (20,[A,C]) (30,[A,C]) (40,[]) (50,[])` →\n`(10,START,A) (20,START,C) (40,END,C) (40,END,A)` — `B` never appears twice in a row.\nAim for O(total stack entries) time.\n",tests:a("profiling",2)}]},{id:"bootloader",title:"Repair Bootloader Program",stage:"onsite",difficulty:"hard",reported:!0,timerMinutes:55,starterCode:`def run(program):
    # -> ("halt", acc) or ("loop", acc)
    ...


def repair(program):  # level 2
    # -> final acc after the one-instruction fix
    ...
`,levels:[{title:"Level 1 — simulate and detect the loop",spec:'A tiny bootloader runs on a machine with an **instruction pointer** (start 0) and an\n**accumulator** (start 0). The program is a list of strings:\n\n- `acc ±n` — add n to the accumulator, move to the next instruction\n- `jmp ±n` — jump n instructions relative to itself\n- `nop ±n` — do nothing, move to the next instruction\n\nThe program **halts** when the pointer lands exactly one past the last instruction.\nImplement `run(program)`: return `("halt", acc)` on halt, or — the moment any instruction\nis about to execute a **second** time — `("loop", acc)` with the accumulator as it stands.\n',tests:a("bootloader",1)},{title:"Level 2 — fix the corruption",spec:"Exactly one control-flow instruction is corrupted: a single `jmp` should be a `nop`\nor vice versa (arguments are intact, `acc` instructions are never wrong). Implement\n`repair(program)`: find the one swap that makes the program halt and return the final\naccumulator value.\n\nBrute force (try each swap, re-run) is fine first; the discussion follow-up is how to do it\nin one pass (which pointer positions can reach the end?).\n",tests:a("bootloader",2)}]},{id:"cache",title:"Design Durable Function Call Cache",stage:"onsite",difficulty:"hard",reported:!0,timerMinutes:55,starterCode:`class LRUCache:
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
`,levels:[{title:"Level 1 — an LRU cache",spec:"Implement `LRUCache(capacity)` with `get(key) -> value | None` and `put(key, value)`,\nboth **O(1)** (excluding key construction):\n\n- at capacity, `put` evicts the **least recently used** entry\n- both a `get` hit and a `put` (new or overwrite) refresh an entry's recency\n\n(`collections.OrderedDict` or a dict + doubly-linked list — be ready to justify either.)\n",tests:a("cache",1)},{title:"Level 2 — keys and the memoize decorator",spec:"One cache serves many functions. Implement `make_key(func, args, kwargs)` and a\n`@memoize(cache)` decorator such that:\n\n- **equivalent calls share a key**: `f(1, 2)`, `f(1)` (with `b=2` default), `f(a=1, b=2)`\n  and `f(b=2, a=1)` all hit the same entry (`inspect.signature(...).bind` +\n  `apply_defaults` is the clean route)\n- identical args to **different functions** must not collide\n- **unhashable arguments** (lists, dicts) must work\n- a cached `None` return is a **hit**, not a miss — don't call the function again\n",tests:a("cache",2)},{title:"Level 3 — survive a crash",spec:`\`LRUCache(capacity, file_path)\` becomes durable: append every mutation to the file as a
log record and flush, so a **new cache constructed on the same path** rebuilds both the
contents **and the exact recency order** (eviction after recovery must match — which means
logging \`get\` hits too). Requirements tested:

- contents survive a restart
- recency order survives a restart
- a **torn final record** (crash mid-write) is tolerated: replay stops there

Keys are strings and values JSON-serializable in the tests. Discussion follow-ups from the
reports: log compaction that survives a crash mid-compaction, two processes sharing the
file, TTL × recovery, flush vs fsync, unserializable return values.
`,tests:a("cache",3)}]}],be=9e4,xe=2e4;let y=null,O=null,V="idle",ye=1;const S=new Map,G=new Set,L=e=>{V=e,G.forEach(s=>s(e))};function we(e){return G.add(e),e(V),()=>{G.delete(e)}}function J(e){S.forEach(s=>{clearTimeout(s.timer),s.reject(new Error(e))}),S.clear()}function ee(){return y=new Worker("/pyodide-worker.js"),L("loading"),O=new Promise((e,s)=>{const p=window.setTimeout(()=>{s(new Error("pyodide took too long to load")),L("error")},be);y.onmessage=r=>{var i,m;if(((i=r.data)==null?void 0:i.type)==="ready"){clearTimeout(p),L("ready"),e();return}const o=S.get((m=r.data)==null?void 0:m.id);o&&(S.delete(r.data.id),clearTimeout(o.timer),r.data.ok?o.resolve(r.data.data):o.reject(new Error(r.data.error??"python worker error")))},y.onerror=r=>{clearTimeout(p),L("error"),J(`python worker crashed: ${r.message}`),s(new Error(r.message))}}),O}function ke(e){y==null||y.terminate(),y=null,J(e),ee().catch(()=>{})}function te(){y||ee().catch(()=>{})}async function K(e){te(),await O;const s=ye++;return new Promise((p,r)=>{const o=window.setTimeout(()=>{S.delete(s),r(new Error("Timed out after 20s — look for an infinite loop. (Python restarted.)")),ke("interrupted by timeout")},xe);S.set(s,{resolve:p,reject:r,timer:o}),y.postMessage({id:s,...e})})}const ve=(e,s)=>K({type:"submit",code:e,tests:s}),Ee=e=>K({type:"run",code:e}),Te=()=>K({type:"reset"}),Se="interview_api_url",F=()=>localStorage.getItem(Se)||"http://localhost:8017",U=e=>`interview_unlocked_${e}`,I=e=>`interview_code_${e}`,N=e=>`interview_timer_${e}`,q=e=>`interview_solved_${e}`,C=e=>{const s=parseInt(localStorage.getItem(U(e.id))??"1",10);return Math.min(Math.max(1,isNaN(s)?1:s),e.levels.length)},Y=e=>localStorage.getItem(q(e.id))==="1",Ae=()=>t.jsx("style",{children:`
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap');
    .interview { font-family: 'Quicksand', 'Nunito', system-ui, sans-serif; }
    .interview .bubble {
      background: #fff; border: 2px solid #f3cde3; border-radius: 24px;
      box-shadow: 0 6px 0 #f3d6e7, 0 10px 24px rgba(214, 150, 190, 0.18);
    }
    .interview .pill {
      border-radius: 999px; border: 2px solid #f3cde3; background: #fff;
      box-shadow: 0 3px 0 #f3d6e7; transition: transform .08s ease, box-shadow .08s ease;
    }
    .interview .pill:hover { transform: translateY(-1px); }
    .interview .pill:active { transform: translateY(2px); box-shadow: 0 1px 0 #f3d6e7; }
    .interview .pill.on { background: linear-gradient(135deg, #ffd3e8, #e5d4ff); border-color: #e6a9cf; }
    .interview .pill:disabled { opacity: .45; transform: none; }
    .interview .editor-wrap {
      background: #211b2e; border-radius: 18px; border: 2px solid #3a2f52;
      box-shadow: inset 0 2px 10px rgba(0,0,0,.35);
    }
    .interview textarea.code, .interview .console-in {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; line-height: 1.55;
      background: transparent; color: #f4ecff; caret-color: #ff9ecb; border: none; outline: none; resize: vertical;
      white-space: pre; tab-size: 4;
    }
    .interview .lvl {
      border-radius: 14px 14px 0 0; border: 2px solid #f3cde3; border-bottom: none; background: #fff6fa;
      padding: 6px 14px; font-weight: 700; font-size: 13px; color: #a0306b;
    }
    .interview .lvl.on { background: linear-gradient(135deg, #ffd3e8, #e5d4ff); }
    .interview .lvl.locked { opacity: .5; }
    .interview .spec { font-size: 13.5px; color: #5b4a66; }
    .interview .spec h3 { font-weight: 700; color: #a0306b; margin: 10px 0 4px; font-size: 14px; }
    .interview .spec p { margin: 6px 0; }
    .interview .spec ul { list-style: disc; padding-left: 20px; margin: 6px 0; }
    .interview .spec code { background: #f6ecff; border-radius: 6px; padding: 1px 5px; font-size: 12px; color: #6b3fa0; }
    .interview .spec pre { background: #211b2e; color: #f4ecff; border-radius: 12px; padding: 10px 12px; overflow-x: auto; font-size: 12px; margin: 8px 0; }
    .interview .spec pre code { background: transparent; color: inherit; padding: 0; }
    .interview .spec table { border-collapse: collapse; margin: 8px 0; font-size: 12.5px; }
    .interview .spec th, .interview .spec td { border: 1.5px solid #f3cde3; padding: 4px 8px; text-align: left; }
    .interview .spec th { background: #fff0f6; color: #a0306b; }
  `});function Re(e){const s=Math.max(0,Math.floor(e/1e3)),p=Math.floor(s/60);return`${String(p).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`}function Ne({value:e,onChange:s}){const p=l.useMemo(()=>e.split(`
`).length,[e]),r=o=>{if(o.key==="Tab"){o.preventDefault();const i=o.currentTarget,{selectionStart:m,selectionEnd:g}=i,b=e.slice(0,m)+"    "+e.slice(g);s(b),requestAnimationFrame(()=>i.setSelectionRange(m+4,m+4))}};return t.jsxs("div",{className:"editor-wrap flex overflow-hidden",children:[t.jsx("div",{className:"select-none text-right pr-2 pl-3 py-3 text-[#6b5d8a] text-[13px] leading-[1.55]",style:{fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace"},children:Array.from({length:p},(o,i)=>t.jsx("div",{children:i+1},i))}),t.jsx("textarea",{className:"code flex-1 py-3 pr-3 min-h-[320px]",spellCheck:!1,value:e,onChange:o=>s(o.target.value),onKeyDown:r})]})}function De({engine:e}){const[s,p]=l.useState([]),[r,o]=l.useState(""),[i,m]=l.useState(!1),g=l.useRef(null);l.useEffect(()=>{var n;(n=g.current)==null||n.scrollIntoView({behavior:"smooth"})},[s]);const b=async()=>{if(!(!r.trim()||i||e==="loading")){m(!0);try{let n;e==="backend"?n=await(await fetch(`${F()}/run`,{method:"POST",body:JSON.stringify({code:r})})).json():n=await Ee(r),p(_=>[..._,{input:r,out:n.out??"",result:n.result,error:n.error}]),o("")}catch(n){k.error(n instanceof Error?n.message:"python engine unavailable")}finally{m(!1)}}},x=async()=>{try{e==="backend"?await fetch(`${F()}/reset`,{method:"POST",body:"{}"}):await Te(),p([]),k.success("kernel reset ✨")}catch{k.error("python engine unavailable")}};return t.jsxs("div",{className:"bubble p-4",children:[t.jsxs("div",{className:"flex items-center justify-between mb-2",children:[t.jsxs("div",{className:"flex items-center gap-2 font-bold text-[#a0306b]",children:[t.jsx(_e,{size:16})," ",e==="backend"?"IPython console":"Python console",t.jsx("span",{className:`inline-block w-2.5 h-2.5 rounded-full ${e==="loading"?"bg-amber-400":"bg-emerald-400"}`,title:e==="backend"?"local IPython backend":e==="pyodide"?"in-browser pyodide":"loading python…"})]}),t.jsxs("button",{className:"pill px-3 py-1 text-xs font-bold text-[#a0306b]",onClick:x,children:[t.jsx(Z,{size:12,className:"inline mr-1"}),"reset kernel"]})]}),t.jsxs("div",{className:"editor-wrap p-3 max-h-56 overflow-y-auto text-[13px]",style:{fontFamily:"ui-monospace, Menlo, monospace"},children:[s.length===0&&t.jsxs("div",{className:"text-[#6b5d8a]",children:["scratch space — ",e==="backend"?"local IPython kernel":"python in your browser",", state persists between cells"]}),s.map((n,_)=>t.jsxs("div",{className:"mb-2",children:[t.jsxs("div",{className:"text-[#8ee7c0] whitespace-pre-wrap",children:[t.jsxs("span",{className:"text-[#6b5d8a]",children:["In [",_+1,"]: "]}),n.input]}),n.out&&t.jsx("div",{className:"text-[#f4ecff] whitespace-pre-wrap",children:n.out}),n.result&&t.jsxs("div",{className:"text-[#ffc6e3] whitespace-pre-wrap",children:[t.jsxs("span",{className:"text-[#6b5d8a]",children:["Out[",_+1,"]: "]}),n.result]}),n.error&&t.jsx("div",{className:"text-[#ff9b9b] whitespace-pre-wrap",children:n.error})]},_)),t.jsx("div",{ref:g})]}),t.jsxs("div",{className:"flex gap-2 mt-2",children:[t.jsx("textarea",{className:"console-in flex-1 editor-wrap px-3 py-2 min-h-[38px]",rows:1,placeholder:">>> try things here (shift+enter to run)",value:r,onChange:n=>o(n.target.value),onKeyDown:n=>{n.key==="Enter"&&n.shiftKey&&(n.preventDefault(),b())}}),t.jsx("button",{className:"pill on px-4 py-1 font-bold text-[#a0306b]",onClick:b,disabled:i,children:"run"})]})]})}function Le({problem:e,engine:s,onProgress:p}){const[r,o]=l.useState(()=>C(e)),[i,m]=l.useState(()=>Math.min(C(e),e.levels.length)),[g,b]=l.useState(()=>localStorage.getItem(I(e.id))??e.starterCode),[x,n]=l.useState(null),[_,E]=l.useState(null),[u,h]=l.useState(!1),[j,A]=l.useState(Date.now()),[D,z]=l.useState(()=>!!localStorage.getItem(N(e.id)));l.useEffect(()=>{o(C(e)),m(Math.min(C(e),e.levels.length)),b(localStorage.getItem(I(e.id))??e.starterCode),n(null),E(null),z(!!localStorage.getItem(N(e.id)))},[e]),l.useEffect(()=>{if(!e.timerMinutes||!D)return;A(Date.now());const c=setInterval(()=>A(Date.now()),1e3);return()=>clearInterval(c)},[e,D]);const ae=()=>{localStorage.setItem(N(e.id),String(Date.now())),A(Date.now()),z(!0)},W=D&&e.timerMinutes?parseInt(localStorage.getItem(N(e.id))??String(Date.now()),10)+e.timerMinutes*6e4:null,P=W?W-j:null,se=c=>{b(c),localStorage.setItem(I(e.id),c)},ne=async()=>{if(u||s==="loading")return;h(!0),n(null),E(null);const c=e.levels[i-1].tests,R=e.levels.slice(0,i-1).flatMap(d=>d.tests),w=[...c.map(d=>({...d,name:d.name})),...R.map(d=>({...d,name:`regression: ${d.name}`}))];try{let d;if(s==="backend"?d=await(await fetch(`${F()}/submit`,{method:"POST",body:JSON.stringify({code:g,tests:w})})).json():d=await ve(g,w),!d.ok){E(d.error??"grader error");return}const B=(d.results??[]).map(f=>({...f,regression:f.name.startsWith("regression:")}));if(n(B),B.every(f=>f.pass)){if(i<e.levels.length){const f=Math.max(r,i+1);localStorage.setItem(U(e.id),String(f)),o(f),m(f),k.success(`Level ${i} cleared! Level ${f} unlocked 🎀`)}else localStorage.setItem(q(e.id),"1"),k.success(`${e.title} — all levels complete! 🎉`);p()}else{const f=B.filter(oe=>!oe.pass).length;k.error(`${f} test${f>1?"s":""} failing`)}}catch(d){k.error(d instanceof Error?d.message:"python engine unavailable")}finally{h(!1)}},re=()=>{confirm("Reset code, progress and timer for this problem?")&&([I,U,N,q].forEach(c=>localStorage.removeItem(c(e.id))),b(e.starterCode),o(1),m(1),n(null),E(null),z(!1),p())},$=e.levels[i-1],ie=Math.max(r-1,Y(e)?e.levels.length:0)*1e3/e.levels.length;return t.jsxs("div",{className:"flex flex-col gap-4",children:[t.jsxs("div",{className:"bubble p-4 flex flex-wrap items-center gap-3",children:[t.jsxs("div",{className:"flex-1 min-w-[200px]",children:[t.jsx("div",{className:"font-bold text-lg text-[#a0306b]",children:e.title}),t.jsxs("div",{className:"text-xs text-[#8a6d99]",children:[Q[e.stage]," · ",e.difficulty," · ",e.reported?"spec from candidate reports":"reconstructed from the title — representative, not verbatim"]})]}),e.timerMinutes&&(D&&P!==null?t.jsxs("div",{className:`pill px-4 py-1.5 font-bold ${P<10*6e4?"text-rose-500":"text-[#a0306b]"}`,children:[t.jsx(X,{size:14,className:"inline mr-1 -mt-0.5"}),Re(P)]}):t.jsxs("button",{className:"pill on px-4 py-1.5 font-bold text-[#a0306b]",onClick:ae,title:`start the ${e.timerMinutes}-minute countdown`,children:[t.jsx(X,{size:14,className:"inline mr-1 -mt-0.5"}),"start ",e.timerMinutes,":00"]})),e.levels.length>1&&t.jsxs("div",{className:"pill px-4 py-1.5 font-bold text-[#a0306b]",title:"250 per level, like the real thing",children:[ie,"/1000"]}),t.jsxs("button",{className:"pill px-3 py-1.5 text-xs font-bold text-[#a0306b]",onClick:re,children:[t.jsx(Z,{size:12,className:"inline mr-1"}),"reset"]})]}),t.jsxs("div",{className:"grid lg:grid-cols-2 gap-4 items-start",children:[t.jsxs("div",{className:"bubble p-4",children:[e.levels.length>1&&t.jsx("div",{className:"flex gap-1 mb-3",children:e.levels.map((c,R)=>{const w=R+1,d=w>r;return t.jsxs("button",{className:`lvl ${w===i?"on":""} ${d?"locked":""}`,disabled:d,onClick:()=>!d&&m(w),title:d?"pass the previous level to unlock":c.title,children:[d?t.jsx(he,{size:11,className:"inline -mt-0.5 mr-1"}):null,"Level ",w]},w)})}),t.jsx("div",{className:"spec max-h-[460px] overflow-y-auto pr-2",children:t.jsx(pe,{remarkPlugins:[me],children:`### ${$.title}

${$.spec}`})})]}),t.jsxs("div",{className:"flex flex-col gap-3",children:[t.jsx(Ne,{value:g,onChange:se}),t.jsxs("div",{className:"flex gap-2",children:[t.jsxs("button",{className:"pill on px-5 py-2 font-bold text-[#a0306b]",onClick:ne,disabled:u||s==="loading",children:[t.jsx(fe,{size:14,className:"inline mr-1 -mt-0.5"}),u?"running…":`run level ${i} tests`]}),s==="loading"&&t.jsx("span",{className:"text-xs text-amber-500 self-center font-bold",children:"loading in-browser python…"})]}),e.id==="crawler"&&i===2&&s==="pyodide"&&t.jsxs("div",{className:"bubble p-3 text-xs font-bold text-amber-600 bg-[#fff7e0]",children:["⚠️ heads-up: you're on in-browser python (pyodide), and WASM can't start threads — real",t.jsx("code",{className:"mx-1",children:"threading"})," code will crash here. To actually exercise this level, run the local backend: ",t.jsx("code",{children:"scripts/.venv-interview/bin/python scripts/interview_server.py"})]}),_&&t.jsx("div",{className:"bubble p-3 text-xs text-rose-600 whitespace-pre-wrap",style:{fontFamily:"ui-monospace, Menlo, monospace"},children:_}),x&&t.jsx("div",{className:"bubble p-3 flex flex-col gap-1 max-h-72 overflow-y-auto",children:x.map((c,R)=>t.jsxs("details",{className:`rounded-xl px-2 py-1 ${c.pass?"bg-[#e9fbf2]":"bg-[#ffecf0]"}`,children:[t.jsxs("summary",{className:"cursor-pointer text-[13px] font-bold flex items-center gap-2",children:[c.pass?t.jsx(H,{size:14,className:"text-emerald-500"}):t.jsx(ue,{size:14,className:"text-rose-500"}),t.jsx("span",{className:c.pass?"text-emerald-700":"text-rose-600",children:c.name})]}),!c.pass&&t.jsxs("div",{className:"text-[11.5px] mt-1 whitespace-pre-wrap",style:{fontFamily:"ui-monospace, Menlo, monospace"},children:[c.error?t.jsx("span",{className:"text-rose-600",children:c.error}):t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"text-[#5b4a66]",children:["expected: ",c.expected]}),t.jsxs("div",{className:"text-rose-600",children:["got: ",c.got]})]}),c.stdout&&t.jsxs("div",{className:"text-[#8a6d99]",children:["stdout: ",c.stdout]})]})]},R))})]})]}),t.jsx(De,{engine:s})]})}const Fe=()=>{const e=le(),[s,p]=l.useState(T[0].id),[r,o]=l.useState(!1),[i,m]=l.useState("idle"),[,g]=l.useState(0),b=l.useCallback(()=>g(u=>u+1),[]);l.useEffect(()=>(te(),we(m)),[]),l.useEffect(()=>{let u=!0;const h=async()=>{try{const A=await fetch(`${F()}/health`);u&&o((await A.json()).ok===!0)}catch{u&&o(!1)}};h();const j=setInterval(h,5e3);return()=>{u=!1,clearInterval(j)}},[]);const x=r?"backend":i==="ready"?"pyodide":"loading",n=T.find(u=>u.id===s)??T[0],_=["oa","screening","onsite"],E=T.filter(Y).length;return t.jsxs("div",{className:"interview min-h-screen",style:{background:"linear-gradient(180deg, #ffeef7 0%, #f3ecff 60%, #e8f6ff 100%)"},children:[t.jsx(Ae,{}),t.jsxs("div",{className:"max-w-6xl mx-auto px-4 py-6",children:[t.jsxs("div",{className:"flex flex-wrap items-center gap-3 mb-5",children:[t.jsx("button",{className:"pill px-4 py-1.5 font-bold text-[#a0306b]",onClick:()=>e("/"),children:"← home"}),t.jsxs("h1",{className:"text-2xl font-bold text-[#a0306b]",children:[t.jsx(ce,{size:20,className:"inline -mt-1 mr-1"}),"interview gym"]}),t.jsxs("span",{className:"pill px-3 py-1 text-xs font-bold text-[#a0306b]",children:[E,"/",T.length," solved"]}),t.jsx("span",{className:`pill px-3 py-1 text-xs font-bold ${x==="backend"?"text-emerald-600":x==="pyodide"?"text-sky-600":i==="error"?"text-rose-500":"text-amber-500"}`,title:"the local backend (scripts/interview_server.py) adds real IPython and real threads; otherwise python runs in your browser via WASM",children:x==="backend"?"engine: local IPython":x==="pyodide"?"engine: pyodide (in-browser)":i==="error"?"python failed to load — refresh?":"loading python…"})]}),t.jsxs("div",{className:"grid md:grid-cols-[230px_1fr] gap-4 items-start",children:[t.jsx("div",{className:"flex flex-col gap-3",children:_.map(u=>t.jsxs("div",{className:"bubble p-3",children:[t.jsx("div",{className:"font-bold text-[#a0306b] text-sm mb-2",children:Q[u]}),t.jsx("div",{className:"flex flex-col gap-1",children:T.filter(h=>h.stage===u).map(h=>t.jsxs("button",{onClick:()=>p(h.id),className:`text-left text-[12.5px] font-semibold rounded-xl px-2 py-1.5 flex items-center gap-1.5 transition-colors ${h.id===s?"bg-gradient-to-r from-[#ffd3e8] to-[#e5d4ff] text-[#a0306b]":"text-[#5b4a66] hover:bg-[#fff0f6]"}`,children:[Y(h)?t.jsx(H,{size:13,className:"text-emerald-500 shrink-0"}):t.jsx(de,{size:13,className:"shrink-0 opacity-50"}),t.jsx("span",{className:"flex-1",children:h.title})]},h.id))})]},u))}),t.jsx(Le,{problem:n,engine:x,onProgress:b})]})]})]})};export{Fe as default};
