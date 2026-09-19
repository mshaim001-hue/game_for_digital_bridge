import Phaser from "phaser";
import { W, H } from "../game/config";
import { C } from "../game/theme";
import { Inspector } from "./Inspector";
import { Lamp } from "./Lamp";

export function coverImage(
  scene: Phaser.Scene,
  key: string,
  kenBurns = true
): Phaser.GameObjects.Image | null {
  if (!scene.textures.exists(key)) return null;
  const img = scene.add.image(W / 2, H / 2, key);
  const scale = Math.max(W / img.width, H / img.height);
  img.setDepth(-20);
  if (kenBurns) {
    img.setScale(scale * 1.06);
    scene.tweens.add({
      targets: img,
      scale: scale * 1.14,
      duration: 28000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  } else {
    img.setScale(scale);
  }
  return img;
}

/** Movie still, or a procedural office if art is missing. */
export function addStage(
  scene: Phaser.Scene,
  key: string,
  kenBurns = true
): Lamp {
  scene.cameras.main.setBackgroundColor(C.night);
  const still = coverImage(scene, key, kenBurns);
  if (!still) {
    scene.add.rectangle(W / 2, H / 2, W, H, 0x141820);
    scene.add.rectangle(W / 2, H - 40, W, 180, 0x2a2430);
    new Inspector(scene, W / 2, H * 0.34);
  }
  const lamp = new Lamp(scene, W / 2, 96);
  addDust(scene);
  return lamp;
}

export function addDust(scene: Phaser.Scene): void {
  if (!scene.textures.exists("px_circle")) return;
  scene.add
    .particles(W / 2, 160, "px_circle", {
      x: { min: -160, max: 160 },
      y: { min: -20, max: 220 },
      speedY: { min: 6, max: 20 },
      speedX: { min: -6, max: 6 },
      lifespan: 2800,
      scale: { start: 0.22, end: 0 },
      alpha: { start: 0.32, end: 0 },
      tint: 0xffe8b0,
      frequency: 200,
      blendMode: "ADD",
    })
    .setDepth(-4);
}

export function bottomScrim(
  scene: Phaser.Scene,
  fromY: number,
  bottomAlpha = 0.82
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillGradientStyle(
    0x000000,
    0x000000,
    0x000000,
    0x000000,
    0,
    0,
    bottomAlpha,
    bottomAlpha
  );
  g.fillRect(0, fromY, W, H - fromY);
  g.setDepth(5);
  return g;
}

/** Blank form on the desk — lamp-warm paper, no app-card chrome. */
export class PaperSheet extends Phaser.GameObjects.Container {
  readonly paperW: number;
  readonly paperH: number;

  constructor(scene: Phaser.Scene, centerY: number, height: number) {
    super(scene, W / 2, centerY);
    this.paperW = W - 80;
    this.paperH = height;
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(
      -this.paperW / 2 + 4,
      -height / 2 + 14,
      this.paperW,
      height,
      3
    );
    g.fillStyle(0xfff6ea, 1);
    g.fillRoundedRect(-this.paperW / 2, -height / 2, this.paperW, height, 3);
    g.lineStyle(1, 0xe2d0b8, 0.9);
    g.strokeRoundedRect(-this.paperW / 2, -height / 2, this.paperW, height, 3);
    g.fillStyle(0x8a1f24, 0.8);
    g.fillRect(-this.paperW / 2 + 16, -height / 2 + 16, 3, height - 32);
    this.add(g);
    this.setDepth(10);
    scene.add.existing(this);
  }

  punch(): void {
    this.scene.tweens.add({
      targets: this,
      y: this.y + 4,
      duration: 80,
      yoyo: true,
    });
  }
}
