import Phaser from "phaser";
import { flow } from "../logic/flow";
import { track } from "../analytics/analytics";
import { FolderButton, SpeechBubble } from "../objects/Talk";
import { addStage, bottomScrim, officeStillKey } from "../objects/Cinematic";
import { W, H } from "../game/config";

export class AbortScene extends Phaser.Scene {
  constructor() {
    super("Abort");
  }

  create(): void {
    addStage(this, officeStillKey(flow.heat), false);
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.28).setDepth(-1);

    new SpeechBubble(
      this,
      "Допрос прерван — вердикт неполный. Без полного дела нельзя сказать, нужна ли декларация.",
      360
    );

    bottomScrim(this, H - 220, 0.72);
    new FolderButton(this, W / 2, H - 148, "Продолжить", W - 80, () => {
      flow.resume();
      track({ name: "resume", sessionId: flow.sessionId });
      this.scene.start("Interrogation");
    });
    new FolderButton(this, W / 2, H - 70, "Сначала", W - 80, () => {
      track({ name: "restart", sessionId: flow.sessionId });
      flow.reset();
      this.scene.start("Title");
    });

  }
}
