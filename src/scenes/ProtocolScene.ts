import Phaser from "phaser";
import { flow } from "../logic/flow";
import { PROTOCOL, VERDICTS } from "../logic/tree";
import { FolderButton } from "../objects/Talk";
import { W, H } from "../game/config";
import { FONT_BODY, FONT_DISPLAY, T } from "../game/theme";

const CREAM = 0xfbf6ee;
const GOLD = 0xc6a35a;

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
    const innerW = W - 132;
    let y = cardTop + 34;

    const eyebrow = this.add
      .text(W / 2, y, "ПРОТОКОЛ ДОПРОСА", {
        fontFamily: FONT_BODY,
        fontSize: "20px",
        color: "#8a6a32",
        align: "center",
      })
      .setOrigin(0.5, 0)
      .setDepth(14);
    eyebrow.setLetterSpacing(2.6);
    y += eyebrow.height + 16;

    const rank = this.add
      .text(W / 2, y, "Подозреваемый", {
        fontFamily: FONT_BODY,
        fontSize: "22px",
        color: "#8a6a32",
        align: "center",
      })
      .setOrigin(0.5, 0)
      .setDepth(14);
    rank.setLetterSpacing(1.4);
    y += rank.height + 6;

    const title = this.add
      .text(W / 2, y, "Добросовестный налогоплательщик", {
        fontFamily: FONT_DISPLAY,
        fontSize: "42px",
        color: T.ink,
        align: "center",
        fontStyle: "900",
        wordWrap: { width: innerW },
        lineSpacing: 2,
      })
      .setOrigin(0.5, 0)
      .setDepth(14);
    y += title.height + 20;

    const resolution = this.add
      .text(W / 2, y, "Резолюция инспектора", {
        fontFamily: FONT_BODY,
        fontSize: "22px",
        color: "#8a6a32",
        align: "center",
      })
      .setOrigin(0.5, 0)
      .setDepth(14);
    resolution.setLetterSpacing(1.4);
    y += resolution.height + 10;

    const headline = this.add
      .text(W / 2, y, card.headline, {
        fontFamily: FONT_DISPLAY,
        fontSize: "36px",
        color: T.ink,
        align: "center",
        wordWrap: { width: innerW },
        lineSpacing: 2,
      })
      .setOrigin(0.5, 0)
      .setDepth(14);
    y += headline.height + 14;

    const body = this.add
      .text(W / 2, y, card.body, {
        fontFamily: FONT_BODY,
        fontSize: "26px",
        color: T.ink,
        align: "center",
        wordWrap: { width: innerW },
        lineSpacing: 5,
      })
      .setOrigin(0.5, 0)
      .setDepth(14);
    y += body.height + 34;

    const nextBtn = new FolderButton(
      this,
      W / 2,
      y + 48,
      "Что дальше?",
      W - 148,
      () => this.scene.start("Wake"),
      { height: 104, size: "42px" }
    );
    this.tweens.add({
      targets: nextBtn,
      alpha: 0.55,
      scale: 1.04,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.drawCard(cardTop, nextBtn.y + 86 - cardTop);
  }

  private placeBackdrop(): void {
    if (this.textures.exists("protocol_header")) {
      const stage = this.add.container(W / 2 + 28, H / 2).setDepth(0);
      const img = this.add.image(0, 0, "protocol_header");
      const baseScale = Math.max(W / img.width, H / img.height);
      stage.add(img);

      // Compact wheel printed on the mug face — keep spokes inside the ceramic.
      const mugX = 72 - img.width / 2;
      const mugY = 428 - img.height / 2;
      if (this.textures.exists("mug_wheel")) {
        const wheel = this.add
          .image(mugX, mugY, "mug_wheel")
          .setDisplaySize(22, 22)
          .setAlpha(0.68)
          .setBlendMode(Phaser.BlendModes.MULTIPLY);
        stage.add(wheel);
      }

      stage.setScale(baseScale * 1.04);
      this.tweens.add({
        targets: stage,
        scale: baseScale * 1.1,
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

}
