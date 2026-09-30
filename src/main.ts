import type Phaser from "phaser";
import "@fontsource/unbounded/700.css";
import "@fontsource/unbounded/900.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import { createGame } from "./game/config";

const parent = document.getElementById("game");
if (!parent) {
  throw new Error("#game root missing");
}

const game = createGame("game");

type BoothWindow = Window & {
  __stats?: () => unknown;
  __game?: Phaser.Game;
  __ANALYTICS_URL?: string;
};

document.addEventListener("contextmenu", (e) => e.preventDefault());

document.addEventListener(
  "pointerdown",
  () => {
    game.sound.unlock();
  },
  { once: true }
);

installFullscreen();

window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    game.sound.unlock();
  }
});

const booth = window as BoothWindow;
booth.__stats = () => {
  try {
    return JSON.parse(
      localStorage.getItem("db_interrogation_analytics_v1") || "{}"
    );
  } catch {
    return {};
  }
};
booth.__game = game;

type FullscreenDocument = Document & { webkitFullscreenElement?: Element | null };
type FullscreenRoot = HTMLElement & { webkitRequestFullscreen?: () => void };

/** Phone or tablet, or an explicit ?kiosk=1 link. Desktop stays windowed. */
function wantsFullscreen(): boolean {
  if (new URLSearchParams(window.location.search).has("kiosk")) return true;
  const nav = navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return false;
  if (
    window.matchMedia("(display-mode: standalone), (display-mode: fullscreen)")
      .matches
  ) {
    return false;
  }
  return (
    navigator.maxTouchPoints > 0 &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

function isFullscreen(): boolean {
  const doc = document as FullscreenDocument;
  return Boolean(document.fullscreenElement || doc.webkitFullscreenElement);
}

function enterFullscreen(): void {
  if (isFullscreen()) return;
  const el = document.documentElement as FullscreenRoot;
  // Must run inside the tap. A delay drops the user-gesture token and
  // Chrome keeps the address bar.
  if (el.requestFullscreen) {
    void el.requestFullscreen({ navigationUI: "hide" }).then(
      () => {
        const orientation = screen.orientation as ScreenOrientation & {
          lock?: (orientation: "portrait") => Promise<void>;
        };
        void orientation.lock?.("portrait").catch(() => undefined);
      },
      () => undefined
    );
    return;
  }
  el.webkitRequestFullscreen?.();
}

function installFullscreen(): void {
  if (!wantsFullscreen()) return;
  const sync = (): void => {
    game.scale.refresh();
  };
  document.addEventListener("fullscreenchange", sync);
  document.addEventListener("webkitfullscreenchange", sync);
  document.addEventListener("pointerup", () => {
    enterFullscreen();
  });
}
