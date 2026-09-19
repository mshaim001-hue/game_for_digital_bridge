import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { TitleScene } from "../scenes/TitleScene";
import { InterrogationScene } from "../scenes/InterrogationScene";
import { VerdictScene } from "../scenes/VerdictScene";
import { WakeCutScene } from "../scenes/WakeCutScene";
import { WakeScene } from "../scenes/WakeScene";
import { AbortScene } from "../scenes/AbortScene";

/** Vertical tablet · cartoon-movie still (matches 720×1280 art). */
export const W = 720;
export const H = 1280;

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: W,
    height: H,
    backgroundColor: "#0c0a0f",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: W,
      height: H,
    },
    input: {
      activePointers: 3,
    },
    render: {
      antialias: true,
      powerPreference: "high-performance",
      roundPixels: true,
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    scene: [
      BootScene,
      TitleScene,
      InterrogationScene,
      VerdictScene,
      WakeCutScene,
      WakeScene,
      AbortScene,
    ],
    audio: {
      noAudio: true,
    },
  });
}
