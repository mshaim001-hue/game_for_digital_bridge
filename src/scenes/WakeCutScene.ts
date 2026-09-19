import Phaser from "phaser";
import { flow } from "../logic/flow";
import { track } from "../analytics/analytics";
import { W, H } from "../game/config";
import { FONT_DISPLAY, FONT_BODY, T } from "../game/theme";

export class WakeCutScene extends Phaser.Scene {
  constructor() {
    super("WakeCut");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0xffffff);
    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff);

    const glitch = this.add
      .text(W / 2, H / 2 - 50, "БЗЗЗЗ", {
        fontFamily: FONT_DISPLAY,
        fontSize: "64px",
        color: "#0c0a0f",
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, H / 2 + 48, "6:00", {
        fontFamily: FONT_DISPLAY,
        fontSize: "52px",
        color: T.gold,
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, H / 2 + 120, "будильник", {
        fontFamily: FONT_BODY,
        fontSize: "18px",
        color: T.muted,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: glitch,
      x: W / 2 + 8,
      duration: 50,
      yoyo: true,
      repeat: 8,
    });

    this.tweens.add({
      targets: flash,
      alpha: 0,
      delay: 200,
      duration: 700,
    });

    this.time.delayedCall(1100, () => {
      flow.beginWake();
      track({ name: "wake", sessionId: flow.sessionId });
      this.scene.start("Wake");
    });
  }
}
