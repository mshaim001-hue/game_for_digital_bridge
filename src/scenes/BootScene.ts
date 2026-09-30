import Phaser from "phaser";
import { W, H } from "../game/config";
import { FONT_DISPLAY, T } from "../game/theme";
import { flow } from "../logic/flow";
import { VERDICTS, type Finale, type VerdictCode } from "../logic/tree";

/** Generate soft procedural textures once; load cinematic stills. */
export class BootScene extends Phaser.Scene {
  private booted = false;

  constructor() {
    super("Boot");
  }

  preload(): void {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0c0a0f);
    this.add
      .text(W / 2, H / 2, "Камера…", {
        fontFamily: FONT_DISPLAY,
        fontSize: "28px",
        color: T.cream,
      })
      .setOrigin(0.5);

    this.load.image("bg_office", "art/office-portrait.png");
    this.load.image("bg_office_press", "art/office-press.png");
    this.load.image("bg_office_check", "art/office-check.png");
    this.load.image("bg_office_suspect", "art/office-suspect.png");
    this.load.image("bg_office_smile", "art/office-smile.png");
    this.load.image("bg_office_clear", "art/office-clear.png");
    this.load.image("bg_title", "art/title-portrait.png");
    this.load.image("bg_wake", "art/finale-sunny.png");
    this.load.image("protocol_header", "art/protocol-screen.jpg");
    this.load.image("qr_aizhan", "art/qr-aizhan.jpg");
    this.load.image("qr_telegram", "art/qr-telegram.png");
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
      const preview = previewVerdict();
      if (preview) {
        flow.previewVerdict(preview);
        this.scene.start("Wake");
        return;
      }
      this.scene.start("Title");
    };

    void document.fonts.ready.then(go);
    this.time.delayedCall(700, go);
  }
}

const FINALE_SAMPLE: Record<Finale, VerdictCode> = {
  OUT: "r_not_resident",
  CLEAR: "r_none",
  WATCH: "r_only270",
  ALERT: "r_both",
};

/** ?wake=OUT|CLEAR|WATCH|ALERT opens that protocol card. */
function previewVerdict(): VerdictCode | null {
  const raw = new URLSearchParams(window.location.search).get("wake");
  if (!raw) return null;
  if (raw in FINALE_SAMPLE) return FINALE_SAMPLE[raw as Finale];
  if (raw in VERDICTS) return raw as VerdictCode;
  return null;
}
