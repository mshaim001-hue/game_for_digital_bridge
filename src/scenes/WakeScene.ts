import Phaser from "phaser";
import { flow } from "../logic/flow";
import { VERDICTS } from "../logic/tree";
import { track } from "../analytics/analytics";
import { FolderButton } from "../objects/Talk";
import { addStage, PaperSheet } from "../objects/Cinematic";
import { W, H } from "../game/config";
import { FONT_BODY, FONT_DISPLAY, T } from "../game/theme";

const CTA_TELEGRAM =
  "Но обязательно подпишитесь на наш Telegram-канал, чтобы быть в курсе новостей.";
const CTA_AIZHAN =
  "Свяжитесь с AI-Zhan — нашим ИИ-агентом, она расскажет, что делать дальше.";
const CTA_SBER = "Sber-invest.kz вам обязательно поможет";

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
    const cta = mustFile ? CTA_AIZHAN : CTA_TELEGRAM;
    const qrKey = mustFile ? "qr_aizhan" : "qr_telegram";

    const { still } = addStage(this, "bg_wake", false);
    // Slight raise so faces clear the QR, but keep head in frame and fill the bottom
    if (still) {
      const cover = Math.max(W / still.width, H / still.height);
      still.setScale(cover * 1.2);
      still.y = H * 0.48;
    }

    const paperH = 700;
    const paperY = H - 40 - paperH / 2;
    new PaperSheet(this, paperY, paperH);
    const top = paperY - paperH / 2;

    const title = mustFile
      ? "Вы обязаны подавать декларацию."
      : "По вашим ответам основания для подачи декларации не выявлены.";
    const body = mustFile
      ? "ФНО 270 — ежегодно. ФНО 250 — если ещё не подавалась ранее или по требованию налогового органа."
      : verdict.legal;

    const titleT = this.add
      .text(W / 2, top + 32, title, {
        fontFamily: FONT_DISPLAY,
        fontSize: "32px",
        color: T.ink,
        align: "center",
        wordWrap: { width: W - 160 },
        lineSpacing: 6,
      })
      .setOrigin(0.5, 0)
      .setDepth(12);

    const bodyT = this.add
      .text(W / 2, titleT.y + titleT.height + 18, body, {
        fontFamily: FONT_BODY,
        fontSize: "14px",
        color: T.ink,
        align: "center",
        wordWrap: { width: W - 180 },
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(12);

    const ctaT = this.add
      .text(W / 2, bodyT.y + bodyT.height + 14, cta, {
        fontFamily: FONT_BODY,
        fontSize: "15px",
        color: T.ink,
        align: "center",
        wordWrap: { width: W - 180 },
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(12);

    let contentBottom = ctaT.y + ctaT.height;
    if (mustFile) {
      const sberT = this.add
        .text(W / 2, contentBottom + 16, CTA_SBER, {
          fontFamily: FONT_DISPLAY,
          fontSize: "26px",
          color: T.speech,
          align: "center",
          wordWrap: { width: W - 160 },
          lineSpacing: 4,
        })
        .setOrigin(0.5, 0)
        .setDepth(12);
      sberT.setStroke("#1a1208", 5);
      sberT.setShadow(0, 2, "#00000055", 4, true, true);
      contentBottom = sberT.y + sberT.height;
    }

    const btnY = top + paperH - 68;
    const qrTop = contentBottom + 16;
    const qrBottom = btnY - 56;
    const qrSize = Math.min(240, Math.max(120, qrBottom - qrTop));
    const qrY = qrTop + (qrBottom - qrTop) / 2;
    this.placeQr(W / 2, qrY, qrKey, qrSize);

    new FolderButton(
      this,
      W / 2,
      btnY,
      "Вернуться",
      W - 160,
      () => this.restartGame(),
      { height: 88, size: "34px" }
    );
  }

  private placeQr(x: number, y: number, key: string, size: number): void {
    if (!this.textures.exists(key)) return;
    const img = this.add.image(x, y, key).setOrigin(0.5).setDepth(12);
    img.setScale(size / Math.max(img.width, img.height));
  }

  private restartGame(): void {
    track({ name: "restart", sessionId: flow.sessionId });
    flow.reset();
    this.scene.start("Title");
  }
}
