import Phaser from "phaser";
import { flow } from "../logic/flow";
import { newSessionId, track } from "../analytics/analytics";
import { UIButton } from "../objects/UIButton";
import { addStage, bottomScrim } from "../objects/Cinematic";
import { W } from "../game/config";
import { FONT_BODY, FONT_DISPLAY, T } from "../game/theme";

export class TitleScene extends Phaser.Scene {
  private starting = false;

  constructor() {
    super("Title");
  }

  create(): void {
    this.starting = false;
    track({ name: "session_start", sessionId: newSessionId() });

    addStage(this, "bg_title");
    bottomScrim(this, 720, 0.9);
    this.input.topOnly = false;

    const fadeIn = (obj: Phaser.GameObjects.GameObject, delay: number) => {
      if ("setAlpha" in obj) (obj as Phaser.GameObjects.Text).setAlpha(0);
      this.tweens.add({
        targets: obj,
        alpha: 1,
        delay,
        duration: 480,
      });
    };

    const title = this.add
      .text(W / 2, 900, "Садитесь.\nУ налоговой к вам\nнесколько вопросов…", {
        fontFamily: FONT_DISPLAY,
        fontSize: "36px",
        color: T.cream,
        align: "center",
        lineSpacing: 8,
      })
      .setOrigin(0.5)
      .setDepth(8);
    fadeIn(title, 280);

    const sub = this.add
      .text(
        W / 2,
        1058,
        "Ответьте на них — и узнайте,\nнужно ли вам подавать декларацию.",
        {
          fontFamily: FONT_BODY,
          fontSize: "18px",
          color: T.dim,
          align: "center",
          lineSpacing: 6,
        }
      )
      .setOrigin(0.5)
      .setDepth(8);
    fadeIn(sub, 460);

    const begin = (): void => {
      if (this.starting) return;
      this.starting = true;
      try {
        this.sound.unlock();
      } catch {
        /* no audio in this build */
      }
      try {
        const id = newSessionId();
        flow.start(id);
        track({ name: "game_start", sessionId: id });
        this.time.delayedCall(1, () => {
          this.scene.start("Interrogation");
        });
      } catch {
        this.starting = false;
      }
    };

    const start = new UIButton(this, W / 2, 1170, {
      label: "Начать допрос",
      width: 420,
      height: 84,
      onClick: begin,
    });
    start.setAlpha(1);

    this.add
      .zone(W / 2, 1185, W, 190)
      .setDepth(55)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", begin);
  }
}
