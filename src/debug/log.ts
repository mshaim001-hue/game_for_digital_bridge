const KEY = "db_debug_log_v1";
const MAX = 40;

export type LogLevel = "info" | "warn" | "error";

export type LogRow = {
  t: string;
  level: LogLevel;
  msg: string;
};

function rows(): LogRow[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as LogRow[];
  } catch {
    return [];
  }
}

function save(list: LogRow[]): void {
  localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
}

function paint(list: LogRow[]): void {
  const el = document.getElementById("dbg");
  if (!el) return;
  el.textContent = list
    .slice(-8)
    .map((r) => `${r.t.slice(11, 19)} ${r.level[0].toUpperCase()} ${r.msg}`)
    .join("\n");
}

export function dbg(msg: string, level: LogLevel = "info"): void {
  const row: LogRow = {
    t: new Date().toISOString(),
    level,
    msg,
  };
  const list = [...rows(), row];
  save(list);
  paint(list);
  if (level === "error") console.error("[dbg]", msg);
  else if (level === "warn") console.warn("[dbg]", msg);
  else console.log("[dbg]", msg);
}

export function dbgError(where: string, err: unknown): void {
  const e = err instanceof Error ? err : new Error(String(err));
  dbg(`${where}: ${e.message}\n${e.stack ?? ""}`, "error");
}

export function hookGlobalErrors(): void {
  window.addEventListener("error", (ev) => {
    dbgError(`window.error ${ev.filename}:${ev.lineno}`, ev.error ?? ev.message);
  });
  window.addEventListener("unhandledrejection", (ev) => {
    dbgError("unhandledrejection", ev.reason);
  });
  paint(rows());
}

type Booth = Window & { __log?: () => LogRow[] };
(window as Booth).__log = () => rows();
