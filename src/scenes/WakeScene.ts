import Phaser from "phaser";
import { flow } from "../logic/flow";
import { LINKS, VERDICTS } from "../logic/tree";
import { track } from "../analytics/analytics";
import { FolderButton } from "../objects/Talk";
import { addStage, PaperSheet } from "../objects/Cinematic";
import { W, H } from "../game/config";
import { FONT_BODY, FONT_DISPLAY, T } from "../game/theme";

/** Placeholder now. Later swap to the real booth file: "art/wake-qr.png". */
const QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(LINKS.soft_qr)}`;

export class WakeScene extends Phaser.Scene {
  constructor() {
    super("Wake");
  }

  create(): void {
    const code = flow.getResult();
    if (!code) {
      this.scene.start("Title");
      return;
    }
    const verdict = VERDICTS[code];
    const mustFile = verdict.finale === "WATCH" || verdict.finale === "ALERT";

    addStage(this, "bg_wake", false);

    const paperH = 680;
    const paperY = H - 48 - paperH / 2;
    new PaperSheet(this, paperY, paperH);
    const top = paperY - paperH / 2;

    const title = mustFile
      ? "Вы обязаны подавать декларацию."
      : verdict.finale === "OUT"
        ? "Декларация вам не нужна."
        : "Пока декларация не нужна.";
    const body = mustFile
      ? "ФНО 270 — ежегодно. ФНО 250 — если ещё не подавалась ранее или по требованию налогового органа."
      : verdict.legal;

    this.add
      .text(W / 2, top + 56, title, {
        fontFamily: FONT_DISPLAY,
        fontSize: "32px",
        color: T.ink,
        align: "center",
        wordWrap: { width: W - 160 },
        lineSpacing: 6,
      })
      .setOrigin(0.5, 0)
      .setDepth(12);

    this.add
      .text(W / 2, top + 158, body, {
        fontFamily: FONT_BODY,
        fontSize: "14px",
        color: T.ink,
        align: "center",
        wordWrap: { width: W - 180 },
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(12);

    this.placeQr(W / 2, top + 360);

    new FolderButton(
      this,
      W / 2,
      top + paperH - 72,
      "Вернуться",
      W - 160,
      () => this.restartGame(),
      { height: 88, size: "34px" }
    );
  }

  private placeQr(x: number, y: number): void {
    const show = (): void => {
      if (!this.textures.exists("wake_qr")) return;
      this.add.image(x, y, "wake_qr").setDisplaySize(296, 296).setDepth(12);
    };
    if (this.textures.exists("wake_qr")) {
      show();
      return;
    }
    this.load.image("wake_qr", QR_SRC);
    this.load.once(Phaser.Loader.Events.COMPLETE, show);
    this.load.start();
  }

  private restartGame(): void {
    track({ name: "restart", sessionId: flow.sessionId });
    flow.reset();
    this.scene.start("Title");
  }
}
