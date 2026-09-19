import Phaser from "phaser";
import { flow } from "../logic/flow";
import { LINKS, VERDICTS } from "../logic/tree";
import { track } from "../analytics/analytics";
import { FolderButton } from "../objects/Talk";
import { addStage, PaperSheet } from "../objects/Cinematic";
import { W, H } from "../game/config";
import { FONT_BODY, FONT_DISPLAY, T } from "../game/theme";

const CTA_TELEGRAM =
  "Но обязательно подпишитесь на наш Телеграм-канал, чтобы быть в курсе.";
const CTA_AIZHAN =
  "Свяжитесь с AI-Zhan — нашим ИИ-агентом, она расскажет, что делать дальше.\nСбер-инвест вам обязательно поможет.";

function qrUrl(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(data)}`;
}

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
    const qrData = mustFile ? LINKS.ai : LINKS.telegram;
    const qrKey = mustFile ? "wake_qr_ai" : "wake_qr_tg";

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
      : verdict.finale === "OUT"
        ? "Декларация вам не нужна."
        : "Пока декларация не нужна.";
    const body = mustFile
      ? "ФНО 270 — ежегодно. ФНО 250 — если ещё не подавалась ранее или по требованию налогового органа."
      : verdict.legal;

    this.add
      .text(W / 2, top + 40, title, {
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
      .text(W / 2, top + 136, body, {
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

    this.placeQr(W / 2, ctaT.y + ctaT.height + 168, qrKey, qrData);

    new FolderButton(
      this,
      W / 2,
      top + paperH - 68,
      "Вернуться",
      W - 160,
      () => this.restartGame(),
      { height: 88, size: "34px" }
    );
  }

  private placeQr(
    x: number,
    y: number,
    key: string,
    data: string
  ): void {
    const show = (): void => {
      if (!this.textures.exists(key)) return;
      this.add
        .image(x, y, key)
        .setOrigin(0.5)
        .setDisplaySize(296, 296)
        .setDepth(12);
    };
    if (this.textures.exists(key)) {
      show();
      return;
    }
    this.load.image(key, qrUrl(data));
    this.load.once(Phaser.Loader.Events.COMPLETE, show);
    this.load.start();
  }

  private restartGame(): void {
    track({ name: "restart", sessionId: flow.sessionId });
    flow.reset();
    this.scene.start("Title");
  }
}
