import Phaser from "phaser";
import { flow, type FlowEvent, type StepId } from "../logic/flow";
import { INTRO_SPEECH } from "../logic/tree";
import { track, trackVerdict } from "../analytics/analytics";
import { Lamp } from "../objects/Lamp";
import { FolderButton, SpeechBubble } from "../objects/Talk";
import { addStage, bottomScrim } from "../objects/Cinematic";
import { W, H } from "../game/config";
import { FONT_BODY, FONT_DISPLAY, T } from "../game/theme";
import { dbg, dbgError } from "../debug/log";

const IDLE_ABORT_MS = 120_000;

export class InterrogationScene extends Phaser.Scene {
  private lamp!: Lamp;
  private uiRoot!: Phaser.GameObjects.Container;
  private reactionText!: Phaser.GameObjects.Text;
  private stamps: Phaser.GameObjects.Text[] = [];
  private locked = false;
  private idleTimer?: Phaser.Time.TimerEvent;
  private selected = new Set<string>();
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super("Interrogation");
  }

  create(): void {
    dbg(`Interrogation: create step=${flow.step}`);
    try {
    // Same finger that tapped Title "Начать" is still down over "Да".
    this.locked = true;
    this.selected = new Set(flow.selected);

    this.lamp = addStage(this, "bg_office", false);
    this.lamp.setHeat(flow.heat);

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
      .text(W / 2, 520, "", {
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
      dbg("Interrogation: answers live");
    });
    dbg("Interrogation: create done");
    } catch (err) {
      dbgError("Interrogation: create", err);
    }
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
    try {
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
    dbg(`Interrogation: SpeechBubble "${speech.slice(0, 40)}…"`);
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

    const chipRows = q.kind === "chips" ? Math.ceil(q.items.length / 2) : 0;
    const dockH = q.kind === "yesno" ? 200 : chipRows * 58 + 130;
    const scrimFrom = H - dockH - 36;
    const scrim = bottomScrim(this, scrimFrom, 0.72);
    this.uiRoot.add(scrim);

    if (q.hint) {
      const hint = this.add
        .text(W / 2, scrimFrom + 22, q.hint, {
          fontFamily: FONT_BODY,
          fontSize: "14px",
          color: T.gold,
        })
        .setOrigin(0.5)
        .setDepth(12);
      this.uiRoot.add(hint);
    }

    if (q.kind === "yesno") {
      const yes = new FolderButton(
        this,
        W / 2,
        H - 148,
        "Да",
        W - 80,
        () => this.onYesNo(q.id, true)
      );
      const no = new FolderButton(
        this,
        W / 2,
        H - 70,
        "Нет",
        W - 80,
        () => this.onYesNo(q.id, false)
      );
      this.uiRoot.add([yes, no]);
      dbg(`Interrogation: renderStep ok ${flow.step} yesno`);
      return;
    }

    this.selected = new Set();
    const cols = 2;
    const chipW = (W - 72) / cols - 8;
    const startY = scrimFrom + (q.hint ? 56 : 36);
    q.items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const chip = new FolderButton(
        this,
        36 + chipW / 2 + col * (chipW + 12),
        startY + row * 58,
        item.label,
        chipW,
        (on) => {
          if (on) this.selected.add(item.id);
          else this.selected.delete(item.id);
          this.bumpIdle();
        },
        { toggle: true, height: 52, size: "14px" }
      );
      this.uiRoot.add(chip);
    });

    const confirmY = startY + chipRows * 58 + 40;
    const confirm = new FolderButton(
      this,
      W / 2 - 150,
      confirmY,
      "В дело",
      280,
      () => this.onChips(q.id, [...this.selected])
    );
    const none = new FolderButton(
      this,
      W / 2 + 150,
      confirmY,
      "Ничего",
      280,
      () => this.onChips(q.id, [])
    );
    this.uiRoot.add([confirm, none]);
    dbg(`Interrogation: renderStep ok ${flow.step}`);
    } catch (err) {
      dbgError("Interrogation: renderStep", err);
    }
  }

  private refreshStamps(): void {
    this.stamps.forEach((s, i) => {
      const on = flow.wave >= i + 1;
      s.setColor(on ? T.gold : T.dim);
    });
  }

  private onYesNo(id: StepId, yes: boolean): void {
    if (this.locked) return;
    this.handleEvent(flow.answerYesNo(id, yes));
  }

  private onChips(id: StepId, ids: string[]): void {
    if (this.locked) return;
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

    this.reactionText.setText(text).setAlpha(1);
    this.tweens.add({
      targets: this.reactionText,
      alpha: 0,
      delay: 480,
      duration: 220,
      onComplete: done,
    });
  }

  shutdown(): void {
    this.idleTimer?.remove(false);
  }
}
