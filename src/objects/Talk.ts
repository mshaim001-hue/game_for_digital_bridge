import Phaser from "phaser";
import { FONT_BODY } from "../game/theme";

/** Mouth of Aizhan on the 720×1280 office still (no Ken Burns). */
export const AIZHAN_MOUTH = { x: 252, y: 382 };

/** Bubble position after manual nudges — keep still, only the tail aims at the mouth. */
const BUBBLE_ANCHOR = { x: 354, y: 130 };

/** Phaser Graphics.arc uses too few segments — corners look cut. */
function arcTo(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  steps = 22
): void {
  for (let i = 1; i <= steps; i++) {
    const t = a0 + ((a1 - a0) * i) / steps;
    g.lineTo(cx + Math.cos(t) * r, cy + Math.sin(t) * r);
  }
}

function quadTo(
  g: Phaser.GameObjects.Graphics,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  steps = 16
): void {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    g.lineTo(
      u * u * x0 + 2 * u * t * cx + t * t * x1,
      u * u * y0 + 2 * u * t * cy + t * t * y1
    );
  }
}

/** Cartoon speech from Aizhan — tail aims at her mouth. */
export class SpeechBubble extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, text: string, maxW = 340) {
    const body = scene.add
      .text(0, 0, text, {
        fontFamily: FONT_BODY,
        fontSize: "20px",
        color: "#1a1208",
        align: "left",
        wordWrap: { width: maxW - 40 },
        lineSpacing: 3,
      })
      .setOrigin(0.5);
    const bw = Math.min(maxW, Math.max(200, body.width + 40));
    const bh = body.height + 32;
    const x = BUBBLE_ANCHOR.x + bw / 2;
    const y = BUBBLE_ANCHOR.y + bh / 2;
    super(scene, x, y);

    const left = -bw / 2;
    const right = bw / 2;
    const top = -bh / 2;
    const bot = bh / 2;
    const r = 28;
    const mouthX = AIZHAN_MOUTH.x - x;
    const mouthY = AIZHAN_MOUTH.y - y;
    const tailL = left + r + 2;
    const tailR = tailL + 34;
    const midX = (tailL + tailR) / 2;
    const tipX = midX + (mouthX - midX) / 3;
    const tipY = bot + (mouthY - bot) / 3;

    const g = scene.add.graphics();
    g.fillStyle(0xfff3e0, 1);
    g.beginPath();
    g.moveTo(left + r, top);
    g.lineTo(right - r, top);
    arcTo(g, right - r, top + r, r, -Math.PI / 2, 0);
    g.lineTo(right, bot - r);
    arcTo(g, right - r, bot - r, r, 0, Math.PI / 2);
    g.lineTo(tailR, bot);
    quadTo(g, tailR, bot, tailR - 2, bot + 8, tipX, tipY);
    quadTo(g, tipX, tipY, tailL + 10, bot + 10, tailL, bot);
    g.lineTo(left + r, bot);
    arcTo(g, left + r, bot - r, r, Math.PI / 2, Math.PI);
    g.lineTo(left, top + r);
    arcTo(g, left + r, top + r, r, Math.PI, (Math.PI * 3) / 2);
    g.closePath();
    g.fillPath();
    g.setAlpha(0.8);

    body.setPosition(0, -2);
    this.add([g, body]);
    this.setDepth(12);
    scene.add.existing(this);
  }
}

/** Binder on the desk — same language as FNO folders in the still. */
export class FolderButton extends Phaser.GameObjects.Container {
  private g: Phaser.GameObjects.Graphics;
  private mark?: Phaser.GameObjects.Text;
  private selected = false;
  private readonly bw: number;
  private readonly bh: number;
  private readonly toggle: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    width: number,
    onClick: (selected: boolean) => void,
    opts?: { toggle?: boolean; height?: number; size?: string }
  ) {
    super(scene, x, y);
    this.bw = width;
    this.bh = opts?.height ?? 68;
    this.toggle = opts?.toggle ?? false;
    this.g = scene.add.graphics();
    this.paint();

    const text = scene.add
      .text(this.toggle ? -width / 2 + 48 : 8, 0, label, {
        fontFamily: FONT_BODY,
        fontSize: opts?.size ?? "20px",
        color: "#f7f1e4",
        fontStyle: "bold",
        wordWrap: { width: width - 64 },
      })
      .setOrigin(this.toggle ? 0 : 0.5, 0.5);

    if (this.toggle) {
      this.mark = scene.add
        .text(-width / 2 + 28, 0, "", {
          fontFamily: FONT_BODY,
          fontSize: "20px",
          color: "#c9a227",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
    }

    const hit = scene.add
      .zone(0, 0, width, this.bh)
      .setInteractive({ useHandCursor: true });
    hit.on("pointerdown", () => this.setScale(0.98));
    hit.on("pointerup", () => {
      this.setScale(1);
      if (this.toggle) {
        this.selected = !this.selected;
        this.paint();
        if (this.mark) this.mark.setText(this.selected ? "✓" : "");
      }
      onClick(this.selected);
    });
    hit.on("pointerout", () => this.setScale(1));

    this.add(this.mark ? [this.g, this.mark, text, hit] : [this.g, text, hit]);
    this.setDepth(12);
    scene.add.existing(this);
  }

  private paint(): void {
    const w = this.bw;
    const h = this.bh;
    this.g.clear();
    this.g.fillStyle(0x000000, 0.35);
    this.g.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, 6);
    this.g.fillStyle(this.selected ? 0x2a2418 : 0x161310, 0.94);
    this.g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    this.g.fillStyle(this.selected ? 0xe0b84a : 0xc9a227, 1);
    this.g.fillRect(-w / 2, -h / 2, 10, h);
  }
}
