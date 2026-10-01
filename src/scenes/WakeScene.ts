import Phaser from "phaser";
import { flow } from "../logic/flow";
import { PROTOCOL, VERDICTS } from "../logic/tree";
import { track } from "../analytics/analytics";
import { FolderButton } from "../objects/Talk";
import { addStage, PaperSheet } from "../objects/Cinematic";
import { W, H } from "../game/config";
import { FONT_BODY, T } from "../game/theme";

const INK = 0x1a1208;
const LINK = "#8a6418";

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
    const card = PROTOCOL[verdict.finale];

    const { still } = addStage(this, "bg_wake", false);
    if (still) {
      const cover = Math.max(W / still.width, H / still.height);
      still.setScale(cover * 1.2);
      still.y = H * 0.48;
    }

    const paperH = 560;
    const paperW = Math.round((W - 80) / 1.35);
    const paperY = H - 36 - paperH / 2;
    new PaperSheet(this, paperY, paperH, paperW);
    const top = paperY - paperH / 2;
    const innerW = paperW - 72;

    const heading = this.add
      .text(W / 2, top + 22, card.wake, {
        fontFamily: FONT_BODY,
        fontSize: "18px",
        color: T.ink,
        align: "center",
        wordWrap: { width: innerW },
        lineSpacing: 3,
      })
      .setOrigin(0.5, 0)
      .setDepth(12);

    const link = this.add
      .text(W / 2, heading.y + heading.height + 8, card.link, {
        fontFamily: FONT_BODY,
        fontSize: "18px",
        color: LINK,
        align: "center",
        fontStyle: "bold",
        wordWrap: { width: innerW },
        lineSpacing: 2,
      })
      .setOrigin(0.5, 0)
      .setDepth(12)
      .setPadding(6, 3, 6, 4)
      .setInteractive({ useHandCursor: true });
    this.add
      .rectangle(
        W / 2,
        link.y + link.height - 3,
        Math.min(link.width - 12, innerW),
        1.5,
        0x8a6418
      )
      .setDepth(12);
    link.on("pointerup", () => this.openLink(card.href));

    const backBtn = new FolderButton(
      this,
      W / 2,
      top + paperH - 48,
      "Вернуться",
      paperW - 56,
      () => this.restartGame(),
      { height: 68, size: "28px" }
    );
    this.tweens.add({
      targets: backBtn,
      alpha: 0.62,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    const gap = 14;
    const qrTop = link.y + link.height + gap;
    const qrBottom = backBtn.y - 34 - gap;
    const maxBox = Math.min(innerW - 40, 280);
    const box = Math.max(140, Math.min(maxBox, qrBottom - qrTop));
    const qrSize = box - 14;
    const qrY = qrTop + (qrBottom - qrTop) / 2;
    this.placeQr(W / 2, qrY, card.qr, qrSize, card.href);
  }

  private placeQr(
    x: number,
    y: number,
    key: string,
    size: number,
    href: string
  ): void {
    const box = size + 14;
    const g = this.add.graphics().setDepth(13);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(x - box / 2, y - box / 2, box, box, 14);
    const arm = Math.max(18, Math.round(size * 0.13));
    const thick = 5;
    const inset = 10;
    const l = x - box / 2 + inset;
    const r = x + box / 2 - inset;
    const t = y - box / 2 + inset;
    const b = y + box / 2 - inset;
    g.fillStyle(INK, 1);
    g.fillRect(l, t, arm, thick);
    g.fillRect(l, t, thick, arm);
    g.fillRect(r - arm, t, arm, thick);
    g.fillRect(r - thick, t, thick, arm);
    g.fillRect(l, b - thick, arm, thick);
    g.fillRect(l, b - arm, thick, arm);
    g.fillRect(r - arm, b - thick, arm, thick);
    g.fillRect(r - thick, b - arm, thick, arm);

    if (this.textures.exists(key)) {
      const img = this.add.image(x, y, key).setDepth(14);
      img.setScale(size / Math.max(img.width, img.height));
    }

    this.add
      .zone(x, y, box, box)
      .setDepth(15)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.openLink(href));
  }

  private openLink(href: string): void {
    window.open(href, "_blank", "noopener,noreferrer");
  }

  private restartGame(): void {
    track({ name: "restart", sessionId: flow.sessionId });
    flow.reset();
    this.scene.start("Title");
  }
}
