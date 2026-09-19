import Phaser from "phaser";
import { W } from "../game/config";
import { C, FONT_BODY, FONT_DISPLAY, T } from "../game/theme";

/** Mouth of Aizhan on the 720×1280 office still (no Ken Burns). */
export const AIZHAN_MOUTH_CALM = { x: 252, y: 382 };
export const AIZHAN_MOUTH_PRESS = { x: 292, y: 448 };
export let AIZHAN_MOUTH = { ...AIZHAN_MOUTH_CALM };

export function aimMouth(press: boolean): void {
  AIZHAN_MOUTH = press ? { ...AIZHAN_MOUTH_PRESS } : { ...AIZHAN_MOUTH_CALM };
}

/** Pin bubble bottom; grow upward. Flush to the right so face stays open. */
const BUBBLE_BOTTOM = 340;
const BUBBLE_MARGIN = 18;

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
    const wrapW = Math.min(maxW, W - BUBBLE_MARGIN * 2) - 36;
    const body = scene.add
      .text(0, 0, text, {
        fontFamily: FONT_BODY,
        fontSize: "16px",
        color: "#1a1208",
        align: "left",
        wordWrap: { width: wrapW },
        lineSpacing: 2,
      })
      .setOrigin(0.5);
    const bw = Math.min(maxW, Math.max(200, body.width + 36));
    const bh = body.height + 28;
    const x = W - BUBBLE_MARGIN - bw / 2;
    let y = BUBBLE_BOTTOM - bh / 2;
    if (y - bh / 2 < BUBBLE_MARGIN) y = BUBBLE_MARGIN + bh / 2;
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
  private enabled = true;
  private readonly bw: number;
  private readonly bh: number;
  private readonly toggle: boolean;
  private readonly tone: "yes" | "no" | "cream";

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    width: number,
    onClick: (selected: boolean) => void,
    opts?: {
      toggle?: boolean;
      height?: number;
      size?: string;
      tone?: "yes" | "no";
      onInfo?: () => void;
    }
  ) {
    super(scene, x, y);
    this.bw = width;
    this.bh = opts?.height ?? 68;
    this.toggle = opts?.toggle ?? false;
    this.tone = opts?.tone ?? "cream";
    this.g = scene.add.graphics();
    this.paint();

    const infoPad = opts?.onInfo ? 52 : 0;
    const text = scene.add
      .text(this.toggle ? -width / 2 + 48 : 0, 0, label, {
        fontFamily: FONT_BODY,
        fontSize: opts?.size ?? "32px",
        color: this.tone === "no" ? T.cream : "#1a1208",
        fontStyle: "bold",
        wordWrap: { width: width - 64 - infoPad },
      })
      .setOrigin(this.toggle ? 0 : 0.5, 0.5);

    if (this.toggle) {
      this.mark = scene.add
        .text(-width / 2 + 28, 0, "", {
          fontFamily: FONT_BODY,
          fontSize: "22px",
          color: "#8a7018",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
    }

    const hitW = opts?.onInfo ? width - 52 : width;
    const hit = scene.add
      .zone(opts?.onInfo ? -26 : 0, 0, hitW, this.bh)
      .setInteractive({ useHandCursor: true });
    hit.on("pointerdown", () => {
      if (!this.enabled) return;
      this.setScale(0.98);
    });
    hit.on("pointerup", () => {
      this.setScale(1);
      if (!this.enabled) return;
      if (this.toggle) {
        this.selected = !this.selected;
        this.paint();
        if (this.mark) this.mark.setText(this.selected ? "✓" : "");
      }
      onClick(this.selected);
    });
    hit.on("pointerout", () => this.setScale(1));

    const kids: Phaser.GameObjects.GameObject[] = this.mark
      ? [this.g, this.mark, text, hit]
      : [this.g, text, hit];

    if (opts?.onInfo) {
      const ix = width / 2 - 26;
      const disc = scene.add.graphics();
      disc.fillStyle(0xffffff, 1);
      disc.fillCircle(ix, 0, 16);
      disc.lineStyle(2.5, C.gold, 1);
      disc.strokeCircle(ix, 0, 16);
      const markI = scene.add
        .text(ix, -1, "i", {
          fontFamily: FONT_DISPLAY,
          fontSize: "20px",
          color: "#1a1208",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      const infoHit = scene.add
        .zone(ix, 0, 44, this.bh)
        .setInteractive({ useHandCursor: true });
      infoHit.on("pointerup", () => opts.onInfo?.());
      kids.push(disc, markI, infoHit);
    }

    this.add(kids);
    this.setDepth(12);
    scene.add.existing(this);
  }

  private paint(): void {
    const w = this.bw;
    const h = this.bh;
    const r = h / 2;
    this.g.clear();
    if (this.tone === "yes") {
      this.g.fillStyle(C.gold, 1);
      this.g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
      this.g.lineStyle(3, C.goldSoft, 1);
      this.g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
      this.g.setAlpha(1);
      return;
    }
    if (this.tone === "no") {
      this.g.fillStyle(0x3a3144, 1);
      this.g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
      this.g.lineStyle(3, 0x5a4f66, 1);
      this.g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
      this.g.setAlpha(1);
      return;
    }
    this.g.fillStyle(0x000000, 0.22);
    this.g.fillRoundedRect(-w / 2 + 2, -h / 2 + 5, w, h, r);
    this.g.fillStyle(this.selected ? 0xffe7b8 : 0xfff6ea, 1);
    this.g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    this.g.lineStyle(2, this.selected ? 0xc9a227 : 0xd8c49a, 1);
    this.g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
    this.g.setAlpha(0.8);
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
    this.setAlpha(v ? 1 : 0.38);
  }
}
