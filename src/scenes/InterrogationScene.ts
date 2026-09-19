import Phaser from "phaser";
import { flow, type FlowEvent, type StepId } from "../logic/flow";
import { INTRO_SPEECH } from "../logic/tree";
import { track, trackVerdict } from "../analytics/analytics";
import { Lamp } from "../objects/Lamp";
import { FolderButton, SpeechBubble, aimMouth } from "../objects/Talk";
import { addStage, bottomScrim, coverImage, officeStillKey } from "../objects/Cinematic";
import { W, H } from "../game/config";
import { FONT_BODY, FONT_DISPLAY, T } from "../game/theme";

const IDLE_ABORT_MS = 120_000;

export class InterrogationScene extends Phaser.Scene {
  private lamp!: Lamp;
  private still: Phaser.GameObjects.Image | null = null;
  private pressed = false;
  private smiled = false;
  private pendingSmile = false;
  private uiRoot!: Phaser.GameObjects.Container;
  private reactionText!: Phaser.GameObjects.Text;
  private stamps: Phaser.GameObjects.Text[] = [];
  private locked = false;
  private idleTimer?: Phaser.Time.TimerEvent;
  private selected = new Set<string>();
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private tip?: Phaser.GameObjects.Container;

  constructor() {
    super("Interrogation");
  }

  create(): void {
    this.locked = true;
    this.selected = new Set(flow.selected);

    this.smiled = flow.heat === "hot" || flow.heat === "boil";
    this.pressed = flow.heat !== "cold";
    aimMouth(this.pressed);
    const stage = addStage(this, officeStillKey(flow.heat), false);
    this.lamp = stage.lamp;
    this.still = stage.still;
    this.lamp.setHeat(flow.heat);
    if (this.pressed) this.cameras.main.setZoom(1.04);

    this.add
      .text(W - 28, 36, "✕  Прервать", {
        fontFamily: FONT_BODY,
        fontSize: "16px",
        color: T.cream,
        backgroundColor: "#00000088",
        padding: { x: 12, y: 8 },
      })
      .setOrigin(1, 0.5)
      .setDepth(30)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => {
        if (this.locked) return;
        flow.abort();
        track({
          name: "abort",
          sessionId: flow.sessionId,
          step: flow.step,
        });
        this.scene.start("Abort");
      });

    this.uiRoot = this.add.container(0, 0).setDepth(11);
    this.reactionText = this.add
      .text(W / 2, 880, "", {
        fontFamily: FONT_DISPLAY,
        fontSize: "26px",
        color: T.speech,
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: W - 80 },
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(20);

    this.particles = this.add.particles(W / 2, H * 0.72, "px_circle", {
      speed: { min: 40, max: 120 },
      lifespan: 500,
      scale: { start: 0.6, end: 0 },
      tint: 0xc9a227,
      quantity: 0,
      emitting: false,
    });
    this.particles.setDepth(21);

    this.input.on("pointerdown", () => this.bumpIdle());
    this.bumpIdle();
    this.renderStep();
    this.time.delayedCall(420, () => {
      this.locked = false;
    });
  }

  private bumpIdle(): void {
    this.idleTimer?.remove(false);
    this.idleTimer = this.time.delayedCall(IDLE_ABORT_MS, () => {
      if (flow.phase !== "INTERROGATION") return;
      flow.abort();
      track({ name: "abort", sessionId: flow.sessionId, step: flow.step });
      this.scene.start("Abort");
    });
  }

  private clearUi(): void {
    this.uiRoot.removeAll(true);
    this.stamps = [];
  }

  private renderStep(): void {
    this.clearUi();
    this.lamp.setHeat(flow.heat);

    track({
      name: "step",
      sessionId: flow.sessionId,
      step: flow.step,
      wave: flow.wave,
    });

    const q = flow.question();
    if (!q) return;

    const speech = flow.showIntro ? `«${INTRO_SPEECH}»\n\n${q.title}` : q.title;
    flow.showIntro = false;
    const bubble = new SpeechBubble(this, speech, 400);
    this.uiRoot.add(bubble);

    const labels = ["Резидент", "Обязательные", "Активы"];
    this.stamps = labels.map((label, i) => {
      const t = this.add
        .text(24 + i * 132, 36, label, {
          fontFamily: FONT_BODY,
          fontSize: "13px",
          color: T.dim,
          backgroundColor: "#00000066",
          padding: { x: 8, y: 5 },
        })
        .setOrigin(0, 0.5)
        .setDepth(12);
      this.uiRoot.add(t);
      return t;
    });
    this.refreshStamps();

    const chipRow = 74;
    const chipRows = q.kind === "chips" ? Math.ceil(q.items.length / 2) : 0;
    const dockH = q.kind === "yesno" ? 340 : chipRows * chipRow + 150;
    const scrimFrom = H - dockH - 36;
    const scrim = bottomScrim(this, scrimFrom, 0.72);
    this.uiRoot.add(scrim);

    if (q.kind === "yesno") {
      const yes = new FolderButton(
        this,
        W / 2,
        H - 280,
        "Да",
        W - 80,
        () => this.onYesNo(q.id, true),
        { height: 88, size: "34px", tone: "yes" }
      );
      const no = new FolderButton(
        this,
        W / 2,
        H - 168,
        "Нет",
        W - 80,
        () => this.onYesNo(q.id, false),
        { height: 88, size: "34px", tone: "no" }
      );
      this.uiRoot.add([yes, no]);
      return;
    }

    this.selected = new Set();
    const cols = 2;
    const chipW = (W - 72) / cols - 8;
    const startY = scrimFrom + 36;
    q.items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const chip = new FolderButton(
        this,
        36 + chipW / 2 + col * (chipW + 12),
        startY + row * chipRow,
        item.label,
        chipW,
        (on) => {
          if (on) this.selected.add(item.id);
          else this.selected.delete(item.id);
          yes.setEnabled(this.selected.size > 0);
          this.bumpIdle();
        },
        {
          toggle: true,
          height: 64,
          size: "18px",
          onInfo: item.tip
            ? () => this.showTip(item.tipTitle ?? item.label, item.tip as string)
            : undefined,
        }
      );
      this.uiRoot.add(chip);
    });

    const confirmY = startY + chipRows * chipRow + 44;
    const yes = new FolderButton(
      this,
      W / 2 - 150,
      confirmY,
      "Да",
      280,
      () => this.onChips(q.id, [...this.selected]),
      { tone: "yes" }
    );
    yes.setEnabled(false);
    const no = new FolderButton(
      this,
      W / 2 + 150,
      confirmY,
      "Нет",
      280,
      () => this.onChips(q.id, []),
      { tone: "no" }
    );
    this.uiRoot.add([yes, no]);
  }

  private showTip(title: string, body: string): void {
    this.closeTip();
    const root = this.add.container(0, 0).setDepth(50);
    const veil = this.add
      .rectangle(W / 2, H / 2, W, H, 0x000000, 0.55)
      .setInteractive();
    const cardW = W - 72;
    const titleT = this.add
      .text(W / 2, 0, title, {
        fontFamily: FONT_DISPLAY,
        fontSize: "22px",
        color: T.ink,
        align: "center",
        wordWrap: { width: cardW - 48 },
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0);
    const bodyT = this.add
      .text(W / 2, 0, body, {
        fontFamily: FONT_BODY,
        fontSize: "18px",
        color: T.ink,
        align: "left",
        wordWrap: { width: cardW - 48 },
        lineSpacing: 5,
      })
      .setOrigin(0.5, 0);
    const cardH = titleT.height + bodyT.height + 88;
    const cardY = H / 2;
    const card = this.add.graphics();
    card.fillStyle(0xfff6ea, 1);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 28);
    card.lineStyle(2, 0xd8c49a, 1);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 28);
    card.setPosition(W / 2, cardY);
    card.setAlpha(0.92);
    titleT.setY(cardY - cardH / 2 + 28);
    bodyT.setY(titleT.y + titleT.height + 16);
    veil.on("pointerup", () => this.closeTip());
    root.add([veil, card, titleT, bodyT]);
    this.tip = root;
  }

  private closeTip(): void {
    this.tip?.destroy(true);
    this.tip = undefined;
  }

  private refreshStamps(): void {
    this.stamps.forEach((s) => s.setColor(T.dim));
  }

  private onYesNo(id: StepId, yes: boolean): void {
    if (this.locked) return;
    this.handleEvent(flow.answerYesNo(id, yes));
  }

  private onChips(id: StepId, ids: string[]): void {
    if (this.locked) return;
    this.pendingSmile = ids.length > 0;
    this.handleEvent(flow.confirmChips(id, ids));
  }

  private handleEvent(event: FlowEvent): void {
    this.locked = true;
    this.bumpIdle();

    const after = () => {
      flow.apply(event);
      if (event.type === "resolve") {
        const code = flow.getResult();
        if (code) trackVerdict(flow.sessionId, code);
        this.scene.start("Verdict");
        return;
      }
      this.locked = false;
      this.renderStep();
    };

    if (event.reaction) {
      this.playReaction(event.reaction, event.heat, after);
    } else {
      if (event.heat) {
        flow.bumpHeat(event.heat);
        this.lamp.setHeat(flow.heat);
      }
      if (this.pendingSmile) {
        this.pendingSmile = false;
        this.cutStill("bg_office_smile", 1.06);
        this.time.delayedCall(560, after);
        return;
      }
      after();
    }
  }

  private playReaction(
    text: string,
    heat: FlowEvent["heat"],
    done: () => void
  ): void {
    if (heat) flow.bumpHeat(heat);
    this.lamp.setHeat(flow.heat);
    this.lamp.flash();
    this.cameras.main.shake(
      140,
      flow.heat === "hot" || flow.heat === "boil" ? 0.007 : 0.003
    );
    this.particles?.explode(14, W / 2, H * 0.72);
    if (this.pendingSmile) {
      this.pendingSmile = false;
      this.cutStill("bg_office_smile", 1.06);
    } else if (flow.heat !== "cold") {
      this.cutStill("bg_office_press", 1.04);
    }

    this.clearUi();
    const hold = 1800;
    this.reactionText.setText(text).setAlpha(1);
    this.tweens.add({
      targets: this.reactionText,
      alpha: 0,
      delay: hold,
      duration: 280,
      onComplete: done,
    });
  }

  private cutStill(key: string, zoom: number): void {
    if (key === "bg_office_smile") {
      if (this.smiled || !this.textures.exists(key)) return;
      this.smiled = true;
      this.pressed = true;
    } else if (this.pressed || this.smiled || !this.textures.exists(key)) {
      return;
    } else {
      this.pressed = true;
    }
    aimMouth(true);
    const next = coverImage(this, key, false);
    if (!next) return;
    next.setAlpha(0).setDepth(-19);
    this.tweens.add({
      targets: next,
      alpha: 1,
      duration: 520,
      ease: "Sine.out",
      onComplete: () => {
        this.still?.destroy();
        this.still = next;
        next.setDepth(-20);
      },
    });
    this.tweens.add({
      targets: this.cameras.main,
      zoom,
      duration: 560,
      ease: "Sine.out",
    });
  }

  shutdown(): void {
    this.closeTip();
    this.idleTimer?.remove(false);
    aimMouth(false);
  }
}
