import { needsDeclaration, type VerdictCode } from "../logic/tree";

export type AnalyticsEvent =
  | { name: "session_start"; sessionId: string }
  | { name: "game_start"; sessionId: string }
  | { name: "step"; sessionId: string; step: string; wave: number }
  | { name: "abort"; sessionId: string; step: string }
  | { name: "resume"; sessionId: string }
  | {
      name: "verdict";
      sessionId: string;
      code: VerdictCode;
      needsDeclaration: boolean;
    }
  | { name: "wake"; sessionId: string }
  | { name: "cta_click"; sessionId: string; action: string }
  | { name: "restart"; sessionId: string };

type Store = {
  sessions: number;
  starts: number;
  completes: number;
  aborts: number;
  needsDeclaration: number;
  dropByStep: Record<string, number>;
  events: Array<AnalyticsEvent & { t: number }>;
};

const KEY = "db_interrogation_analytics_v1";
const MAX_EVENTS = 400;

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("empty");
    return JSON.parse(raw) as Store;
  } catch {
    return {
      sessions: 0,
      starts: 0,
      completes: 0,
      aborts: 0,
      needsDeclaration: 0,
      dropByStep: {},
      events: [],
    };
  }
}

function save(store: Store): void {
  try {
    if (store.events.length > MAX_EVENTS) {
      store.events = store.events.slice(-MAX_EVENTS);
    }
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode */
  }
}

let store = load();

/** Optional endpoint — set via ?api=https://... or window.__ANALYTICS_URL */
function endpoint(): string | null {
  const w = window as Window & { __ANALYTICS_URL?: string };
  if (w.__ANALYTICS_URL) return w.__ANALYTICS_URL;
  const q = new URLSearchParams(location.search).get("api");
  return q;
}

function post(event: AnalyticsEvent & { t: number }): void {
  const url = endpoint();
  if (!url) return;
  const body = JSON.stringify(event);
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* offline ok */
  }
}

export function track(event: AnalyticsEvent): void {
  const stamped = { ...event, t: Date.now() };
  store.events.push(stamped);

  switch (event.name) {
    case "session_start":
      store.sessions += 1;
      break;
    case "game_start":
      store.starts += 1;
      break;
    case "abort":
      store.aborts += 1;
      store.dropByStep[event.step] = (store.dropByStep[event.step] || 0) + 1;
      break;
    case "verdict":
      store.completes += 1;
      if (event.needsDeclaration) store.needsDeclaration += 1;
      break;
    default:
      break;
  }

  save(store);
  post(stamped);
}

export function trackVerdict(sessionId: string, code: VerdictCode): void {
  track({
    name: "verdict",
    sessionId,
    code,
    needsDeclaration: needsDeclaration(code),
  });
}

export function getStats(): Store {
  return structuredClone(store);
}

export function newSessionId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
