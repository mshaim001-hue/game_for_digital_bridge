import Phaser from "phaser";
import { flow } from "../logic/flow";
import { FINALE_SHELL, VERDICTS } from "../logic/tree";
import { FolderButton, SpeechBubble, aimMouth } from "../objects/Talk";
import { addStage, bottomScrim, officeStillKey } from "../objects/Cinematic";
import { W, H } from "../game/config";

export class VerdictScene extends Phaser.Scene {
  constructor() {
    super("Verdict");
  }

  create(): void {
    const code = flow.getResult();
    if (!code) {
      this.scene.start("Title");
      return;
    }
    const verdict = VERDICTS[code];
    const shell = FINALE_SHELL[verdict.finale];
    flow.bumpHeat(shell.heat);

    const calm = verdict.finale === "CLEAR" || verdict.finale === "OUT";
    const stillKey = calm ? "bg_office_clear" : officeStillKey(flow.heat);
    aimMouth(!calm);
    const { lamp } = addStage(this, stillKey, false);
    lamp.setHeat(calm ? "cold" : flow.heat);
    if (calm) this.cameras.main.setZoom(1);

    if (verdict.finale === "OUT") {
      this.time.delayedCall(400, () => lamp.extinguish());
    }
    if (verdict.finale === "ALERT") {
      this.cameras.main.shake(400, 0.008);
    }

    new SpeechBubble(this, `«${shell.speech.join(" ")}»`, 360);

    bottomScrim(this, H - 220, 0.78);

    const continueBtn = new FolderButton(
      this,
      W / 2,
      H - 160,
      "Продолжить",
      W - 80,
      () => {
        flow.beginWake();
        this.scene.start("Wake");
      },
      { height: 88, size: "34px", tone: "yes" }
    );

    this.tweens.add({
      targets: continueBtn,
      alpha: 0.42,
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }
}
