// In-browser Python engine: wraps the Pyodide Web Worker (public/pyodide-worker.js).
// A watchdog terminates and respawns the worker if a request hangs (infinite loops),
// since a blocked WASM interpreter can't be interrupted any other way.

export type PyStatus = "idle" | "loading" | "ready" | "error";

interface Pending {
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
  timer: number;
}

const LOAD_TIMEOUT = 90_000; // first load pulls ~10MB from the CDN
const RUN_TIMEOUT = 20_000;

let worker: Worker | null = null;
let ready = false;
let readyPromise: Promise<void> | null = null;
let status: PyStatus = "idle";
let nextId = 1;
const pending = new Map<number, Pending>();
const listeners = new Set<(s: PyStatus) => void>();

const setStatus = (s: PyStatus) => {
  status = s;
  listeners.forEach((fn) => fn(s));
};

export const pyStatus = () => status;

export function onPyStatus(fn: (s: PyStatus) => void) {
  listeners.add(fn);
  fn(status);
  return () => {
    listeners.delete(fn);
  };
}

function failAll(reason: string) {
  pending.forEach((p) => {
    clearTimeout(p.timer);
    p.reject(new Error(reason));
  });
  pending.clear();
}

function spawn(): Promise<void> {
  worker = new Worker("/pyodide-worker.js");
  ready = false;
  setStatus("loading");
  readyPromise = new Promise<void>((resolve, reject) => {
    const loadTimer = window.setTimeout(() => {
      reject(new Error("pyodide took too long to load"));
      setStatus("error");
    }, LOAD_TIMEOUT);
    worker!.onmessage = (e: MessageEvent) => {
      if (e.data?.type === "ready") {
        clearTimeout(loadTimer);
        ready = true;
        setStatus("ready");
        resolve();
        return;
      }
      const p = pending.get(e.data?.id);
      if (!p) return;
      pending.delete(e.data.id);
      clearTimeout(p.timer);
      if (e.data.ok) p.resolve(e.data.data);
      else p.reject(new Error(e.data.error ?? "python worker error"));
    };
    worker!.onerror = (e) => {
      clearTimeout(loadTimer);
      setStatus("error");
      failAll(`python worker crashed: ${e.message}`);
      reject(new Error(e.message));
    };
  });
  return readyPromise;
}

function respawn(reason: string) {
  worker?.terminate();
  worker = null;
  failAll(reason);
  spawn().catch(() => undefined);
}

/** Start loading Pyodide in the background (idempotent). */
export function ensurePyodide() {
  if (!worker) spawn().catch(() => undefined);
}

async function request<T>(msg: Record<string, unknown>): Promise<T> {
  ensurePyodide();
  await readyPromise;
  const id = nextId++;
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      pending.delete(id);
      reject(new Error("Timed out after 20s — look for an infinite loop. (Python restarted.)"));
      respawn("interrupted by timeout");
    }, RUN_TIMEOUT);
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer });
    worker!.postMessage({ id, ...msg });
  });
}

export interface PySubmitResult {
  ok: boolean;
  error?: string;
  results?: {
    name: string;
    pass: boolean;
    got: string | null;
    expected: string;
    error: string | null;
    stdout: string;
  }[];
}

export interface PyRunResult {
  ok: boolean;
  out: string;
  result: string | null;
  error: string | null;
}

export const pySubmit = (code: string, tests: unknown[]) =>
  request<PySubmitResult>({ type: "submit", code, tests });

export const pyRun = (code: string) => request<PyRunResult>({ type: "run", code });

export const pyReset = () => request<Record<string, never>>({ type: "reset" });
