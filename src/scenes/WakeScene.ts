import Phaser from "phaser";
import { flow } from "../logic/flow";
import { VERDICTS } from "../logic/tree";
import { FolderButton } from "../objects/Talk";
import { addStage, PaperSheet } from "../objects/Cinematic";
import { W, H } from "../game/config";
import { FONT_DISPLAY, T } from "../game/theme";

export class WakeScene extends Phaser.Scene {
  constructor() {
    super("Wake");
  }

  create(): void {
    const code = flow.getResult();
    if (!code) {
      this.scene.start("Title");
      return;
    }
    const verdict = VERDICTS[code];
    const mustFile = verdict.finale === "WATCH" || verdict.finale === "ALERT";
    const title = mustFile
      ? "Вы обязаны подавать декларацию."
      : "По вашим ответам основания для подачи декларации не выявлены.";

    const { still } = addStage(this, "bg_wake", false);
    if (still) {
      const cover = Math.max(W / still.width, H / still.height);
      still.setScale(cover * 1.2);
      still.y = H * 0.48;
    }

    const paperH = 460;
    const paperY = H - 36 - paperH / 2;
    new PaperSheet(this, paperY, paperH);
    const top = paperY - paperH / 2;

    this.add
      .text(W / 2, top + 56, title, {
        fontFamily: FONT_DISPLAY,
        fontSize: "34px",
        color: T.ink,
        align: "center",
        wordWrap: { width: W - 160 },
        lineSpacing: 6,
      })
      .setOrigin(0.5, 0)
      .setDepth(12);

    const nextBtn = new FolderButton(
      this,
      W / 2,
      top + paperH - 72,
      "Что дальше?",
      W - 160,
      () => this.scene.start("Protocol"),
      { height: 88, size: "34px" }
    );

    this.tweens.add({
      targets: nextBtn,
      alpha: 0.62,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }
}
