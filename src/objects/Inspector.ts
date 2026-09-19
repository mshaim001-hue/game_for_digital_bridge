import Phaser from "phaser";
import type { Heat } from "../logic/tree";

type Face = "neutral" | "brow" | "boil";

function faceFromHeat(heat: Heat): Face {
  if (heat === "boil") return "boil";
  if (heat === "hot") return "brow";
  return "neutral";
}

/** Cartoon inspector Aizhan — procedural, no fanservice. */
export class Inspector extends Phaser.GameObjects.Container {
  private browL: Phaser.GameObjects.Rectangle;
  private browR: Phaser.GameObjects.Rectangle;
  private mouth: Phaser.GameObjects.Rectangle;
  private folder: Phaser.GameObjects.Rectangle;
  private badge: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const body = scene.add.rectangle(0, 70, 120, 140, 0x1e3a5f).setOrigin(0.5);
    const collar = scene.add.triangle(0, 10, 0, 0, -30, 40, 30, 40, 0xf2efe8);
    const head = scene.add.circle(0, -40, 48, 0xf0d9b5);
    const hair = scene.add.ellipse(0, -70, 100, 40, 0x2b1d14);
    const glasses = scene.add.rectangle(0, -38, 78, 18, 0x111111, 0.15);
    const lensL = scene.add.circle(-18, -38, 14, 0xffffff, 0.08).setStrokeStyle(2, 0x222222);
    const lensR = scene.add.circle(18, -38, 14, 0xffffff, 0.08).setStrokeStyle(2, 0x222222);
    const eyeL = scene.add.circle(-18, -38, 4, 0x1a1a1a);
    const eyeR = scene.add.circle(18, -38, 4, 0x1a1a1a);
    this.browL = scene.add.rectangle(-18, -54, 22, 4, 0x2b1d14);
    this.browR = scene.add.rectangle(18, -54, 22, 4, 0x2b1d14);
    this.mouth = scene.add.rectangle(0, -18, 18, 3, 0xb07a6a);
    this.folder = scene.add.rectangle(70, 90, 54, 70, 0xc9a227).setAngle(8);
    const folderLine = scene.add.rectangle(70, 70, 40, 3, 0x8a6d12).setAngle(8);
    this.badge = scene.add
      .text(0, 40, "Айжан Н.", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        color: "#f5f0e8",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add([
      body,
      collar,
      hair,
      head,
      glasses,
      lensL,
      lensR,
      eyeL,
      eyeR,
      this.browL,
      this.browR,
      this.mouth,
      this.folder,
      folderLine,
      this.badge,
    ]);
    scene.add.existing(this);
    this.setHeat("cold");
  }

  setHeat(heat: Heat): void {
    const face = faceFromHeat(heat);
    if (face === "neutral") {
      this.browL.setAngle(0).setY(-54);
      this.browR.setAngle(0).setY(-54);
      this.mouth.setScale(1, 1).setY(-18);
    } else if (face === "brow") {
      this.browL.setAngle(-12).setY(-56);
      this.browR.setAngle(12).setY(-56);
      this.mouth.setScale(0.7, 1).setY(-16);
    } else {
      this.browL.setAngle(-22).setY(-58);
      this.browR.setAngle(22).setY(-58);
      this.mouth.setScale(1.2, 1.4).setY(-14);
    }
  }

  stamp(): void {
    this.scene.tweens.add({
      targets: this.folder,
      y: this.folder.y - 12,
      angle: 0,
      duration: 120,
      yoyo: true,
    });
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.03,
      scaleY: 0.97,
      duration: 100,
      yoyo: true,
    });
  }

  nod(): void {
    this.scene.tweens.add({
      targets: this,
      y: this.y + 6,
      duration: 140,
      yoyo: true,
    });
  }
}
