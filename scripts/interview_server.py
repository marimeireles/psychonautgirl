#!/usr/bin/env python3
"""Backend for the /interview practice page.

Runs a persistent IPython shell for the console panel and grades submissions
in a fresh subprocess per run (like CodeSignal does).

Usage:  python3 scripts/interview_server.py   (listens on http://localhost:8017)

Endpoints (all JSON):
  GET  /health            -> {ok, ipython}
  POST /run    {code}     -> {ok, out, result}        persistent console cell
  POST /reset             -> {ok}                      fresh console shell
  POST /submit {code, tests:[{name, call, expected}]}
                          -> {ok, results:[{name, pass, got, expected, error, stdout}]}
"""
import io
import json
import subprocess
import sys
import traceback
from contextlib import redirect_stdout, redirect_stderr
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 8017

try:
    from IPython.core.interactiveshell import InteractiveShell
    HAVE_IPYTHON = True
except ImportError:
    InteractiveShell = None
    HAVE_IPYTHON = False


def new_shell():
    if HAVE_IPYTHON:
        InteractiveShell.clear_instance()
        return InteractiveShell.instance()
    return {"__name__": "__console__"}  # plain-exec fallback namespace


SHELL = new_shell()

# Each test re-execs the submitted code into a fresh namespace so module-level
# state never leaks between test cases (matching how real graders run).
HARNESS = r"""
import io, json, sys, traceback
payload = json.load(sys.stdin)
results = []
for t in payload["tests"]:
    ns = {"__name__": "__main__"}
    buf = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = buf
    got_repr, ok, err = None, False, None
    try:
        exec(compile(payload["code"], "solution.py", "exec"), ns)
        if t.get("setup"):
            exec(compile(t["setup"], "test_setup.py", "exec"), ns)
        got = eval(t["call"], ns)
        got_repr = repr(got)
        ok = got_repr == t["expected"]
    except Exception:
        err = traceback.format_exc(limit=6)
    finally:
        sys.stdout = old_stdout
    results.append({
        "name": t["name"], "pass": ok, "got": got_repr,
        "expected": t["expected"], "error": err,
        "stdout": buf.getvalue()[-2000:],
    })
print(json.dumps({"results": results}))
"""


def grade(code, tests):
    payload = json.dumps({"code": code, "tests": tests})
    try:
        proc = subprocess.run(
            [sys.executable, "-I", "-c", HARNESS],
            input=payload, capture_output=True, text=True, timeout=15,
        )
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": "Timed out after 15s — look for an infinite loop."}
    if proc.returncode != 0:
        return {"ok": False, "error": (proc.stderr or "grader crashed")[-2000:]}
    try:
        return {"ok": True, **json.loads(proc.stdout.strip().splitlines()[-1])}
    except Exception:
        return {"ok": False, "error": ("could not parse grader output:\n" + proc.stdout)[-2000:]}


def run_cell(code):
    out = io.StringIO()
    result_repr = None
    error = None
    try:
        with redirect_stdout(out), redirect_stderr(out):
            if HAVE_IPYTHON:
                res = SHELL.run_cell(code, store_history=True)
                if res.result is not None:
                    result_repr = repr(res.result)
                if res.error_before_exec:
                    error = str(res.error_before_exec)
            else:
                # echo the value of a trailing expression, like a REPL would
                import ast
                tree = ast.parse(code, "<console>")
                if tree.body and isinstance(tree.body[-1], ast.Expr):
                    last = tree.body.pop()
                    exec(compile(tree, "<console>", "exec"), SHELL)
                    value = eval(compile(ast.Expression(last.value), "<console>", "eval"), SHELL)
                    if value is not None:
                        result_repr = repr(value)
                else:
                    exec(compile(code, "<console>", "exec"), SHELL)
    except Exception:
        error = traceback.format_exc(limit=4)
    return {"ok": error is None, "out": out.getvalue()[-6000:], "result": result_repr, "error": error}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):  # quieter logs
        sys.stderr.write("[interview] %s\n" % (fmt % args))

    def _send(self, obj, status=200):
        body = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send({"ok": True})

    def do_GET(self):
        if self.path == "/health":
            self._send({"ok": True, "ipython": HAVE_IPYTHON})
        else:
            self._send({"ok": False, "error": "not found"}, 404)

    def do_POST(self):
        global SHELL
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length) or b"{}")
        except Exception:
            self._send({"ok": False, "error": "bad json"}, 400)
            return
        if self.path == "/run":
            self._send(run_cell(body.get("code", "")))
        elif self.path == "/reset":
            SHELL = new_shell()
            self._send({"ok": True})
        elif self.path == "/submit":
            self._send(grade(body.get("code", ""), body.get("tests", [])))
        else:
            self._send({"ok": False, "error": "not found"}, 404)


if __name__ == "__main__":
    print(f"interview backend on http://localhost:{PORT}  (IPython: {HAVE_IPYTHON})")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
