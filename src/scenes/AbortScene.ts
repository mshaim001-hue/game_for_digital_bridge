import Phaser from "phaser";
import { flow } from "../logic/flow";
import { track } from "../analytics/analytics";
import { FolderButton, SpeechBubble } from "../objects/Talk";
import { addStage, bottomScrim } from "../objects/Cinematic";
import { W, H } from "../game/config";
import { FONT_BODY, T } from "../game/theme";

export class AbortScene extends Phaser.Scene {
  constructor() {
    super("Abort");
  }

  create(): void {
    addStage(this, "bg_office", false);
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

    this.add
      .text(W / 2, H - 210, "Прервано", {
        fontFamily: FONT_BODY,
        fontSize: "14px",
        color: T.gold,
      })
      .setOrigin(0.5)
      .setDepth(12);
  }
}
