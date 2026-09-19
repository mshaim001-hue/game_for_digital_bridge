import Phaser from "phaser";
import type { Heat } from "../logic/tree";

const HEAT_ALPHA: Record<Heat, number> = {
  cold: 0.2,
  warm: 0.32,
  hot: 0.48,
  boil: 0.66,
};

const HEAT_TINT: Record<Heat, number> = {
  cold: 0xfff3c4,
  warm: 0xffd27a,
  hot: 0xff9f43,
  boil: 0xff5a3d,
};

/** Additive lamp bloom over the movie still — intensity follows interrogation heat. */
export class Lamp extends Phaser.GameObjects.Image {
  private heat: Heat = "cold";
  private pulse?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      scene.textures.exists("glow")
        ? "glow"
        : scene.textures.exists("px_circle")
          ? "px_circle"
          : "__MISSING"
    );
    this.setBlendMode(Phaser.BlendModes.ADD);
    this.setDisplaySize(640, 640);
    this.setDepth(-5);
    scene.add.existing(this);
    this.setHeat("cold");
  }

  setHeat(heat: Heat): void {
    this.heat = heat;
    this.setTint(HEAT_TINT[heat]);
    const a = HEAT_ALPHA[heat];
    this.pulse?.stop();
    this.pulse = this.scene.tweens.add({
      targets: this,
      alpha: { from: a * 0.72, to: a },
      duration: heat === "boil" ? 220 : heat === "hot" ? 380 : 800,
      yoyo: true,
      repeat: -1,
    });
  }

  flash(onDone?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0.95,
      duration: 80,
      yoyo: true,
      onComplete: () => {
        this.setHeat(this.heat);
        onDone?.();
      },
    });
  }

  extinguish(): void {
    this.pulse?.stop();
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 700,
    });
  }
}
