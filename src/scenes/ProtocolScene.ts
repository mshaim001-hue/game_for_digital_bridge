import Phaser from "phaser";
import { flow } from "../logic/flow";
import { PROTOCOL, VERDICTS } from "../logic/tree";
import { track } from "../analytics/analytics";
import { W, H } from "../game/config";
import { FONT_BODY, FONT_DISPLAY, T } from "../game/theme";

const CREAM = 0xfbf6ee;
const GOLD = 0xc6a35a;
const INK = 0x1a1208;
const LINK = "#8a6418";

export class ProtocolScene extends Phaser.Scene {
  constructor() {
    super("Protocol");
  }

  create(): void {
    const code = flow.getResult();
    if (!code) {
      this.scene.start("Title");
      return;
    }
    const card = PROTOCOL[VERDICTS[code].finale];

    this.cameras.main.setBackgroundColor("#1a120c");
    this.placeBackdrop();

    const cardTop = 500;
    const cardBottom = H - 18;
    const cardH = cardBottom - cardTop;
    this.drawCard(cardTop, cardH);

    const innerW = W - 148;
    let y = cardTop + 26;

    const eyebrow = this.add
      .text(W / 2, y, "ПРОТОКОЛ ДОПРОСА", {
        fontFamily: FONT_BODY,
        fontSize: "15px",
        color: "#8a6a32",
        align: "center",
      })
      .setOrigin(0.5, 0)
      .setDepth(14);
    eyebrow.setLetterSpacing(2.4);
    y += eyebrow.height + 14;

    const rank = this.add
      .text(W / 2, y, "Ваше звание", {
        fontFamily: FONT_BODY,
        fontSize: "16px",
        color: "#8a6a32",
        align: "center",
      })
      .setOrigin(0.5, 0)
      .setDepth(14);
    rank.setLetterSpacing(1.2);
    y += rank.height + 4;

    const title = this.add
      .text(W / 2, y, card.title, {
        fontFamily: FONT_DISPLAY,
        fontSize: "40px",
        color: T.ink,
        align: "center",
        fontStyle: "900",
        wordWrap: { width: innerW },
        lineSpacing: 0,
      })
      .setOrigin(0.5, 0)
      .setDepth(14);
    y += title.height + 12;

    const body = this.add
      .text(W / 2, y, card.body, {
        fontFamily: FONT_BODY,
        fontSize: "20px",
        color: T.ink,
        align: "center",
        wordWrap: { width: innerW },
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(14);
    y += body.height + 8;

    const link = this.add
      .text(W / 2, y, card.link, {
        fontFamily: FONT_BODY,
        fontSize: "20px",
        color: LINK,
        align: "center",
        fontStyle: "bold",
        wordWrap: { width: innerW },
        lineSpacing: 2,
      })
      .setOrigin(0.5, 0)
      .setDepth(14)
      .setPadding(8, 4, 8, 6)
      .setInteractive({ useHandCursor: true });
    this.add
      .rectangle(W / 2, link.y + link.height - 4, Math.min(link.width - 16, innerW), 2, 0x8a6418)
      .setDepth(14);
    link.on("pointerup", () => this.openLink(card.href));
    y = link.y + link.height + 8;

    const scan = this.add
      .text(0, 0, card.scan, {
        fontFamily: FONT_BODY,
        fontSize: "18px",
        color: T.ink,
        align: "center",
        fontStyle: "bold",
        wordWrap: { width: innerW },
        lineSpacing: 2,
      })
      .setOrigin(0.5, 0)
      .setDepth(14);

    const restart = this.add
      .text(0, 0, "Пройти ещё раз", {
        fontFamily: FONT_BODY,
        fontSize: "20px",
        color: "#5c534c",
      })
      .setOrigin(0.5, 0)
      .setDepth(14)
      .setPadding(16, 8, 16, 8)
      .setInteractive({ useHandCursor: true });
    restart.on("pointerup", () => this.restartGame());

    const footerH = scan.height + 8 + restart.height;
    const bottom = cardBottom - 16;
    const avail = bottom - footerH - 8 - y;
    const box = Math.min(innerW, Math.max(180, avail));
    const qrSize = box - 20;
    const qrY = y + box / 2;
    this.placeQr(W / 2, qrY, card.qr, qrSize, card.href);

    const scanY = qrY + box / 2 + 10;
    scan.setPosition(W / 2, scanY);
    restart.setPosition(W / 2, scanY + scan.height + 4);
    this.add
      .rectangle(
        W / 2,
        restart.y + restart.height - 6,
        restart.width - 32,
        1.5,
        0x5c534c
      )
      .setDepth(14);
  }

  private placeBackdrop(): void {
    if (this.textures.exists("protocol_header")) {
      const img = this.add.image(W / 2, H / 2, "protocol_header").setDepth(0);
      const scale = Math.max(W / img.width, H / img.height);
      img.setScale(scale * 1.04);
      this.tweens.add({
        targets: img,
        scale: scale * 1.1,
        y: H / 2 - 10,
        duration: 14000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }

    if (this.textures.exists("glow")) {
      const lamp = this.add
        .image(418, 72, "glow")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xffd27a)
        .setDisplaySize(280, 280)
        .setDepth(2)
        .setAlpha(0.16);
      this.tweens.add({
        targets: lamp,
        alpha: 0.48,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }

    if (!this.textures.exists("px_circle")) return;
    this.add
      .particles(W / 2, 150, "px_circle", {
        x: { min: -200, max: 200 },
        y: { min: -20, max: 220 },
        speedY: { min: 10, max: 28 },
        speedX: { min: -10, max: 10 },
        lifespan: 2800,
        scale: { start: 0.45, end: 0 },
        alpha: { start: 0.55, end: 0 },
        tint: 0xffe8b0,
        frequency: 90,
        blendMode: "ADD",
      })
      .setDepth(2);
  }

  private drawCard(top: number, height: number): void {
    const x = 22;
    const w = W - 44;
    const r = 36;
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x000000, 0.28);
    g.fillRoundedRect(x + 3, top + 8, w, height, r);
    g.fillStyle(CREAM, 1);
    g.fillRoundedRect(x, top, w, height, r);
    g.lineStyle(4, GOLD, 1);
    g.strokeRoundedRect(x + 2, top + 2, w - 4, height - 4, r - 2);
  }

  private placeQr(
    x: number,
    y: number,
    key: string,
    size: number,
    href: string
  ): void {
    const box = size + 20;
    const g = this.add.graphics().setDepth(13);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(x - box / 2, y - box / 2, box, box, 18);
    const arm = Math.max(26, Math.round(size * 0.16));
    const thick = 7;
    const inset = 14;
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
