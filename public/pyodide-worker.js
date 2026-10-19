// Web Worker that runs the interview grader + console on Pyodide (in-browser Python).
// Protocol: {id, type: "submit"|"run"|"reset", code?, tests?} ->
//           {type:"ready"} once loaded, then {id, ok, data?|error?} per request.
/* eslint-disable no-undef */

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

const SETUP = `
import ast, io, json, traceback
from contextlib import redirect_stdout, redirect_stderr

__console_ns = {"__name__": "__console__"}

def __reset():
    global __console_ns
    __console_ns = {"__name__": "__console__"}

def __run(code):
    out = io.StringIO()
    result = None
    error = None
    try:
        with redirect_stdout(out), redirect_stderr(out):
            tree = ast.parse(code, "<console>")
            if tree.body and isinstance(tree.body[-1], ast.Expr):
                last = tree.body.pop()
                exec(compile(tree, "<console>", "exec"), __console_ns)
                value = eval(compile(ast.Expression(last.value), "<console>", "eval"), __console_ns)
                if value is not None:
                    result = repr(value)
            else:
                exec(compile(code, "<console>", "exec"), __console_ns)
    except Exception:
        error = traceback.format_exc(limit=4)
    return json.dumps({"ok": error is None, "out": out.getvalue()[-6000:], "result": result, "error": error})

def __submit(payload_json):
    payload = json.loads(payload_json)
    results = []
    for t in payload["tests"]:
        ns = {"__name__": "__main__"}
        buf = io.StringIO()
        got_repr, ok, err = None, False, None
        try:
            with redirect_stdout(buf):
                exec(compile(payload["code"], "solution.py", "exec"), ns)
                if t.get("setup"):
                    exec(compile(t["setup"], "test_setup.py", "exec"), ns)
                got = eval(t["call"], ns)
            got_repr = repr(got)
            ok = got_repr == t["expected"]
        except Exception:
            err = traceback.format_exc(limit=6)
        results.append({
            "name": t["name"], "pass": ok, "got": got_repr,
            "expected": t["expected"], "error": err,
            "stdout": buf.getvalue()[-2000:],
        })
    return json.dumps({"ok": True, "results": results})
`;

let pyodide = null;

const loading = (async () => {
  importScripts(PYODIDE_URL + "pyodide.js");
  pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
  pyodide.runPython(SETUP);
  postMessage({ type: "ready" });
})();

onmessage = async (e) => {
  const { id, type, code, tests } = e.data;
  try {
    await loading;
    if (type === "submit") {
      pyodide.globals.set("__payload", JSON.stringify({ code, tests }));
      const out = pyodide.runPython("__submit(__payload)");
      postMessage({ id, ok: true, data: JSON.parse(out) });
    } else if (type === "run") {
      pyodide.globals.set("__cell", code);
      const out = pyodide.runPython("__run(__cell)");
      postMessage({ id, ok: true, data: JSON.parse(out) });
    } else if (type === "reset") {
      pyodide.runPython("__reset()");
      postMessage({ id, ok: true, data: {} });
    } else {
      postMessage({ id, ok: false, error: "unknown request type " + type });
    }
  } catch (err) {
    postMessage({ id, ok: false, error: String(err) });
  }
};
