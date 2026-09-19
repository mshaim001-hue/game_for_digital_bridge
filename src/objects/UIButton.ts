import Phaser from "phaser";
import { C, FONT_BODY, T } from "../game/theme";

type ButtonOpts = {
  label: string;
  width?: number;
  height?: number;
  fill?: number;
  textColor?: string;
  onClick: () => void;
};

function paintRound(
  g: Phaser.GameObjects.Graphics,
  w: number,
  h: number,
  fill: number,
  stroke: number
): void {
  g.clear();
  g.fillStyle(fill, 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
  g.lineStyle(3, stroke, 1);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
}

/** Solid CTA — title / wake. Not used on the dossier paper. */
export class UIButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private enabled = true;
  private readonly bw: number;
  private readonly bh: number;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: ButtonOpts) {
    super(scene, x, y);
    this.bw = opts.width ?? 280;
    this.bh = opts.height ?? 76;
    const fill = opts.fill ?? C.gold;
    const stroke = opts.fill && opts.fill !== C.gold ? 0x5a4f66 : C.goldSoft;
    this.bg = scene.add.graphics();
    paintRound(this.bg, this.bw, this.bh, fill, stroke);

    this.label = scene.add
      .text(0, 0, opts.label, {
        fontFamily: FONT_BODY,
        fontSize: "22px",
        color: opts.textColor ?? T.ink,
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: this.bw - 28 },
      })
      .setOrigin(0.5);

    this.add([this.bg, this.label]);
    scene.add.existing(this);
    this.setSize(this.bw, this.bh);
    this.setInteractive({
      useHandCursor: true,
      hitArea: new Phaser.Geom.Rectangle(
        -this.bw / 2,
        -this.bh / 2,
        this.bw,
        this.bh
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    });
    this.setDepth(40);

    this.on("pointerdown", () => {
      if (!this.enabled) return;
      this.setScale(0.97);
    });
    this.on("pointerup", () => {
      this.setScale(1);
      if (!this.enabled) return;
      opts.onClick();
    });
    this.on("pointerout", () => this.setScale(1));
  }

  setLabel(text: string): void {
    this.label.setText(text);
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
    this.setAlpha(v ? 1 : 0.45);
  }
}

/** Rubber-stamp on paper — outline, not a website pill. */
export class StampButton extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    width: number,
    onClick: () => void,
    muted = false
  ) {
    super(scene, x, y);
    const h = 56;
    const ink = muted ? 0x6a6058 : 0x7a1f24;
    const g = scene.add.graphics();
    g.lineStyle(3, ink, 0.9);
    g.strokeRoundedRect(-width / 2, -h / 2, width, h, 4);
    const t = scene.add
      .text(0, 0, label, {
        fontFamily: FONT_BODY,
        fontSize: "18px",
        color: muted ? T.muted : "#7a1f24",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5);
    const hit = scene.add
      .zone(0, 0, width, h)
      .setInteractive({ useHandCursor: true });
    hit.on("pointerdown", () => this.setScale(0.97));
    hit.on("pointerup", () => {
      this.setScale(1);
      onClick();
    });
    hit.on("pointerout", () => this.setScale(1));
    this.add([g, t, hit]);
    scene.add.existing(this);
    this.setDepth(12);
  }
}

/** Form checkbox row — same language as the papers in the still. */
export class CaseChoice extends Phaser.GameObjects.Container {
  chipId: string;
  private box: Phaser.GameObjects.Graphics;
  private mark: Phaser.GameObjects.Text;
  private selected = false;
  private readonly bw: number;
  private readonly bh: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    label: string,
    width: number,
    onActivate: (id: string, selected: boolean) => void,
    opts?: { toggle?: boolean; height?: number; size?: string }
  ) {
    super(scene, x, y);
    this.chipId = id;
    this.bw = width;
    this.bh = opts?.height ?? 64;
    const toggle = opts?.toggle ?? true;

    this.box = scene.add.graphics();
    this.mark = scene.add
      .text(-width / 2 + 28, 0, "", {
        fontFamily: FONT_BODY,
        fontSize: "22px",
        color: "#7a1f24",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const text = scene.add
      .text(-width / 2 + 52, 0, label, {
        fontFamily: FONT_BODY,
        fontSize: opts?.size ?? "20px",
        color: T.ink,
        wordWrap: { width: width - 72 },
      })
      .setOrigin(0, 0.5);

    const hit = scene.add
      .zone(0, 0, width, this.bh)
      .setInteractive({ useHandCursor: true });
    hit.on("pointerup", () => {
      if (toggle) {
        this.selected = !this.selected;
        this.paint();
        onActivate(id, this.selected);
      } else {
        this.selected = true;
        this.paint();
        onActivate(id, true);
      }
    });

    this.add([this.box, this.mark, text, hit]);
    scene.add.existing(this);
    this.setDepth(12);
    this.paint();
  }

  private paint(): void {
    this.box.clear();
    if (this.selected) {
      this.box.fillStyle(0xf3e2d4, 0.7);
      this.box.fillRect(-this.bw / 2, -this.bh / 2, this.bw, this.bh);
    }
    this.box.lineStyle(2, 0x2a2218, 0.9);
    this.box.strokeRect(-this.bw / 2 + 16, -11, 22, 22);
    this.mark.setText(this.selected ? "×" : "");
  }
}

/** @deprecated alias — checklist chips */
export class ChipButton extends CaseChoice {}
