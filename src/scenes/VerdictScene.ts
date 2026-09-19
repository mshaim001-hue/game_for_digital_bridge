import Phaser from "phaser";
import { flow } from "../logic/flow";
import { FINALE_SHELL, VERDICTS } from "../logic/tree";
import { FolderButton, SpeechBubble } from "../objects/Talk";
import { addStage, bottomScrim } from "../objects/Cinematic";
import { W, H } from "../game/config";
import { FONT_BODY, FONT_DISPLAY, T } from "../game/theme";

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

    const lamp = addStage(this, "bg_office", false);
    lamp.setHeat(flow.heat);

    if (verdict.finale === "OUT") {
      this.time.delayedCall(400, () => lamp.extinguish());
    }
    if (verdict.finale === "ALERT") {
      this.cameras.main.shake(400, 0.008);
    }

    new SpeechBubble(this, `«${shell.speech.join(" ")}»`, 360);

    bottomScrim(this, H - 280, 0.78);

    if (verdict.finale === "ALERT" || verdict.finale === "WATCH") {
      ["Штраф", "Пеня", "Счета"].forEach((tag, i) => {
        this.add
          .text(W / 2 - 170 + i * 170, H - 236, tag, {
            fontFamily: FONT_DISPLAY,
            fontSize: "16px",
            color: "#fff5f0",
            backgroundColor: "#ff5a3d",
            padding: { x: 12, y: 8 },
          })
          .setOrigin(0.5)
          .setDepth(12);
      });
    }

    this.add
      .text(W / 2, H - 188, verdict.badge, {
        fontFamily: FONT_BODY,
        fontSize: "15px",
        color: T.gold,
      })
      .setOrigin(0.5)
      .setDepth(12);

    this.add
      .text(W / 2, H - 156, verdict.legal, {
        fontFamily: FONT_BODY,
        fontSize: "14px",
        color: T.dim,
        align: "center",
        wordWrap: { width: W - 80 },
      })
      .setOrigin(0.5, 0)
      .setDepth(12);

    new FolderButton(
      this,
      W / 2,
      H - 64,
      "… коснись, чтобы проснуться",
      W - 80,
      () => {
        flow.beginWakeCut();
        this.scene.start("WakeCut");
      }
    );
  }
}
