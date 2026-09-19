import Phaser from "phaser";
import { W, H } from "../game/config";
import { FONT_DISPLAY, T } from "../game/theme";
import { dbg } from "../debug/log";

/** Generate soft procedural textures once; load cinematic stills. */
export class BootScene extends Phaser.Scene {
  private booted = false;

  constructor() {
    super("Boot");
  }

  preload(): void {
    dbg("Boot: preload");
    this.add.rectangle(W / 2, H / 2, W, H, 0x0c0a0f);
    this.add
      .text(W / 2, H / 2, "Камера…", {
        fontFamily: FONT_DISPLAY,
        fontSize: "28px",
        color: T.gold,
      })
      .setOrigin(0.5);

    this.load.image("bg_office", "art/office-portrait.png");
    this.load.image("bg_title", "art/title-portrait.png");
    this.load.image("bg_wake", "art/wake-portrait.png");
  }

  create(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 8);
    g.generateTexture("px_circle", 16, 16);
    g.clear();
    for (let i = 10; i >= 1; i--) {
      g.fillStyle(0xffffff, 0.07);
      g.fillCircle(128, 128, i * 12);
    }
    g.generateTexture("glow", 256, 256);
    g.destroy();

    const go = (): void => {
      if (this.booted) return;
      this.booted = true;
      dbg("Boot: start Title");
      this.scene.start("Title");
    };

    void document.fonts.ready.then(go);
    this.time.delayedCall(700, go);
  }
}
