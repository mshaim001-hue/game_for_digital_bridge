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

if (new URLSearchParams(window.location.search).has("kiosk")) {
  const enterKiosk = (): void => {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      void el.requestFullscreen().catch(() => undefined);
    }
  };
  document.addEventListener(
    "pointerup",
    () => {
      window.setTimeout(enterKiosk, 400);
    },
    { once: true }
  );
}

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
