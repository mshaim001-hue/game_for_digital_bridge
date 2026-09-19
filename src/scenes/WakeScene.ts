import Phaser from "phaser";
import { flow } from "../logic/flow";
import { FINALE_SHELL, LINKS, VERDICTS } from "../logic/tree";
import { track } from "../analytics/analytics";
import { UIButton } from "../objects/UIButton";
import { addStage, PaperSheet } from "../objects/Cinematic";
import { W, H } from "../game/config";
import { FONT_BODY, FONT_DISPLAY, T } from "../game/theme";

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
    const shell = FINALE_SHELL[verdict.finale];
    const url =
      shell.ctaAction === "restart"
        ? LINKS.soft_qr
        : LINKS[shell.ctaAction as keyof typeof LINKS] ?? LINKS.soft_qr;

    addStage(this, "bg_wake", false);

    this.add
      .text(W / 2, 48, "Утро · пробуждение", {
        fontFamily: FONT_BODY,
        fontSize: "16px",
        color: T.ink,
        backgroundColor: "#f7f1e4cc",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(8);

    this.add
      .text(W / 2, 110, shell.wakeTitle, {
        fontFamily: FONT_DISPLAY,
        fontSize: "28px",
        color: T.ink,
        align: "center",
        wordWrap: { width: W - 80 },
        backgroundColor: "#f7f1e4ee",
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(8);

    const paperH = 640;
    const paperY = H - 20 - paperH / 2;
    new PaperSheet(this, paperY, paperH);
    const top = paperY - paperH / 2;

    this.add
      .text(W / 2, top + 40, shell.wakeSub, {
        fontFamily: FONT_BODY,
        fontSize: "17px",
        color: T.muted,
        align: "center",
        wordWrap: { width: W - 120 },
      })
      .setOrigin(0.5, 0)
      .setDepth(12);

    this.add
      .text(W / 2, top + 96, verdict.badge, {
        fontFamily: FONT_DISPLAY,
        fontSize: "15px",
        color: T.gold,
      })
      .setOrigin(0.5)
      .setDepth(12);

    this.add
      .text(W / 2, top + 126, verdict.legal, {
        fontFamily: FONT_BODY,
        fontSize: "14px",
        color: T.ink,
        align: "center",
        wordWrap: { width: W - 130 },
      })
      .setOrigin(0.5, 0)
      .setDepth(12);

    const qrY = top + 250;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`;
    this.load.image("wake_qr", qrUrl);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      if (this.textures.exists("wake_qr")) {
        this.add.image(W / 2, qrY, "wake_qr").setDisplaySize(120, 120).setDepth(12);
        this.add
          .text(W / 2, qrY + 78, "Наведите камеру", {
            fontFamily: FONT_BODY,
            fontSize: "14px",
            color: T.muted,
          })
          .setOrigin(0.5)
          .setDepth(12);
      }
    });
    this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
      this.add
        .text(W / 2, qrY, "QR офлайн", {
          fontFamily: FONT_BODY,
          fontSize: "18px",
          color: T.muted,
        })
        .setOrigin(0.5)
        .setDepth(12);
    });
    this.load.start();

    new UIButton(this, W / 2, top + 430, {
      label: shell.ctaPrimary,
      width: 520,
      height: 64,
      onClick: () => {
        track({
          name: "cta_click",
          sessionId: flow.sessionId,
          action: shell.ctaAction,
        });
        window.open(url, "_blank", "noopener");
      },
    });

    new UIButton(this, W / 2, top + 504, {
      label: shell.ctaSecondary,
      width: 520,
      height: 56,
      fill: 0x3a3144,
      textColor: T.cream,
      onClick: () => {
        track({
          name: "cta_click",
          sessionId: flow.sessionId,
          action: shell.ctaSecAction,
        });
        if (shell.ctaSecAction === "restart") {
          this.restartGame();
          return;
        }
        window.open(
          LINKS[shell.ctaSecAction as keyof typeof LINKS],
          "_blank",
          "noopener"
        );
      },
    });

    new UIButton(this, W / 2, top + 572, {
      label: "Пройти допрос снова",
      width: 520,
      height: 50,
      fill: 0xd9cbb8,
      textColor: T.ink,
      onClick: () => this.restartGame(),
    });
  }

  private restartGame(): void {
    track({ name: "restart", sessionId: flow.sessionId });
    flow.reset();
    if (this.textures.exists("wake_qr")) {
      this.textures.remove("wake_qr");
    }
    this.scene.start("Title");
  }
}
