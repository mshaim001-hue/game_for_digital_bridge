import {
  ASSET_ITEMS,
  MANDATORY_CATEGORIES,
  MICRO,
  SPOUSE_FOREIGN_ASSETS,
  VERDICTS,
  maxHeat,
  type ChipItem,
  type Heat,
  type VerdictCode,
} from "./tree";

export type GamePhase =
  | "IDLE"
  | "INTERROGATION"
  | "VERDICT_DREAM"
  | "WAKE"
  | "ABORTED";

export type StepId =
  | "e0"
  | "q1_1"
  | "q1_2"
  | "q1_3"
  | "q2_1"
  | "q2_2"
  | "q2_2_f250"
  | "q2_2_assets"
  | "q2_3"
  | "q2_3_f250"
  | "verdict"
  | "wake_cut"
  | "wake"
  | "abort";

export type YesNoQuestion = {
  kind: "yesno";
  id: StepId;
  title: string;
  hint?: string;
  wave: 1 | 2 | 3;
};

export type ChipsQuestion = {
  kind: "chips";
  id: StepId;
  title: string;
  hint?: string;
  items: ChipItem[];
  wave: 1 | 2 | 3;
};

export type Question = YesNoQuestion | ChipsQuestion;

export type FlowEvent =
  | { type: "goto"; step: StepId; reaction?: string; heat?: Heat }
  | {
      type: "resolve";
      code: VerdictCode;
      reaction?: string;
      heat?: Heat;
    };

export type SessionAnswers = Record<string, unknown>;

export class InterrogationFlow {
  phase: GamePhase = "IDLE";
  step: StepId = "e0";
  wave: 0 | 1 | 2 | 3 = 0;
  heat: Heat = "cold";
  answers: SessionAnswers = {};
  selected = new Set<string>();
  resumeStep: StepId | null = null;
  showIntro = true;
  sessionId = "";

  reset(): void {
    this.phase = "IDLE";
    this.step = "e0";
    this.wave = 0;
    this.heat = "cold";
    this.answers = {};
    this.selected = new Set();
    this.resumeStep = null;
    this.showIntro = true;
    this.sessionId = "";
  }

  start(sessionId: string): void {
    this.reset();
    this.sessionId = sessionId;
    this.phase = "INTERROGATION";
    this.wave = 1;
    this.step = "q1_1";
    this.showIntro = true;
  }

  abort(): void {
    if (this.phase !== "INTERROGATION") return;
    this.resumeStep = this.step;
    this.phase = "ABORTED";
    this.step = "abort";
  }

  resume(): void {
    this.phase = "INTERROGATION";
    this.step = this.resumeStep ?? "q1_1";
  }

  bumpHeat(level?: Heat): void {
    if (!level) return;
    this.heat = maxHeat(this.heat, level);
  }

  apply(event: FlowEvent): void {
    if (event.heat) this.bumpHeat(event.heat);
    if (event.type === "goto") {
      this.step = event.step;
      return;
    }
    this.answers.result = event.code;
    const finale = VERDICTS[event.code].finale;
    if (finale === "ALERT") this.bumpHeat("boil");
    else if (finale === "WATCH") this.bumpHeat("hot");
    this.phase = "VERDICT_DREAM";
    this.step = "verdict";
  }

  question(): Question | null {
    switch (this.step) {
      case "q1_1":
        return {
          kind: "yesno",
          id: "q1_1",
          wave: 1,
          title: "Вы являетесь гражданином Республики Казахстан?",
          hint: "Гражданство РК.",
        };
      case "q1_2":
        return {
          kind: "yesno",
          id: "q1_2",
          wave: 1,
          title: "Пребывали ли вы в РК более 183 дней?",
          hint: "Срок пребывания.",
        };
      case "q1_3":
        return {
          kind: "yesno",
          id: "q1_3",
          wave: 1,
          title: "Центр жизненных интересов — в Республике Казахстан?",
          hint: "Семья, имущество, деятельность.",
        };
      case "q2_1":
        return {
          kind: "chips",
          id: "q2_1",
          wave: 2,
          title: "Относитесь ли вы к обязательным категориям?",
          hint: "Глава дела: Обязательные.",
          items: MANDATORY_CATEGORIES,
        };
      case "q2_2":
        return {
          kind: "yesno",
          id: "q2_2",
          wave: 2,
          title: "Супруг(а) относится к обязательным категориям?",
        };
      case "q2_2_f250":
        return {
          kind: "yesno",
          id: "q2_2_f250",
          wave: 2,
          title: "Подавали ли вы ФНО 250 ранее?",
        };
      case "q2_2_assets":
        return {
          kind: "chips",
          id: "q2_2_assets",
          wave: 2,
          title: "Есть ли зарубежные активы?",
          items: SPOUSE_FOREIGN_ASSETS,
        };
      case "q2_3":
        return {
          kind: "chips",
          id: "q2_3",
          wave: 3,
          title: "Есть ли другие основания?",
          hint: "Глава дела: Активы / доходы.",
          items: ASSET_ITEMS,
        };
      case "q2_3_f250":
        return {
          kind: "yesno",
          id: "q2_3_f250",
          wave: 3,
          title: "Подавали ли вы ФНО 250 ранее?",
        };
      default:
        return null;
    }
  }

  answerYesNo(qid: StepId, yes: boolean): FlowEvent {
    this.answers[qid as string] = yes;

    if (qid === "q1_1") {
      if (yes) {
        this.wave = 2;
        return {
          type: "goto",
          step: "q2_1",
          reaction: MICRO.resident_yes,
          heat: "warm",
        };
      }
      return { type: "goto", step: "q1_2", reaction: MICRO.resident_check };
    }
    if (qid === "q1_2") {
      if (yes) {
        this.wave = 2;
        return {
          type: "goto",
          step: "q2_1",
          reaction: MICRO.resident_yes,
          heat: "warm",
        };
      }
      return { type: "goto", step: "q1_3" };
    }
    if (qid === "q1_3") {
      if (yes) {
        this.wave = 2;
        return {
          type: "goto",
          step: "q2_1",
          reaction: MICRO.resident_yes,
          heat: "warm",
        };
      }
      return { type: "resolve", code: "r_not_resident" };
    }
    if (qid === "q2_2") {
      if (yes) {
        return {
          type: "goto",
          step: "q2_2_f250",
          reaction: MICRO.spouse,
          heat: "hot",
        };
      }
      this.wave = 3;
      return { type: "goto", step: "q2_3" };
    }
    if (qid === "q2_2_f250") {
      if (yes) return { type: "resolve", code: "r_spouse_only270" };
      this.selected = new Set();
      return { type: "goto", step: "q2_2_assets" };
    }
    if (qid === "q2_3_f250") {
      const assets = (this.answers.q2_3_items as string[]) || [];
      const hasForeign = assets.some((id) =>
        ASSET_ITEMS.some((a) => a.id === id && a.foreign)
      );
      return {
        type: "resolve",
        code: yes ? "r_only270" : hasForeign ? "r_both" : "r_only270",
      };
    }
    return { type: "goto", step: this.step };
  }

  confirmChips(stepId: StepId, ids: string[]): FlowEvent {
    this.selected = new Set(ids);

    if (stepId === "q2_1") {
      this.answers.q2_1 = ids;
      if (ids.length > 0) {
        return {
          type: "resolve",
          code: "r_mandatory",
          reaction: MICRO.mandatory,
          heat: "hot",
        };
      }
      return { type: "goto", step: "q2_2" };
    }
    if (stepId === "q2_2_assets") {
      this.answers.q2_2_assets = ids;
      if (ids.length > 0) {
        return {
          type: "resolve",
          code: "r_spouse_need250",
          reaction: MICRO.foreign,
          heat: "hot",
        };
      }
      return {
        type: "resolve",
        code: "r_spouse_no250",
        reaction: MICRO.empty,
      };
    }
    if (stepId === "q2_3") {
      this.answers.q2_3_items = ids;
      if (ids.length === 0) {
        return { type: "resolve", code: "r_none", reaction: MICRO.empty };
      }
      const foreign = ids.some((id) =>
        ASSET_ITEMS.some((a) => a.id === id && a.foreign)
      );
      if (foreign) {
        return {
          type: "goto",
          step: "q2_3_f250",
          reaction: MICRO.foreign,
          heat: "hot",
        };
      }
      return { type: "goto", step: "q2_3_f250" };
    }
    return { type: "goto", step: this.step };
  }

  beginWakeCut(): void {
    this.phase = "WAKE";
    this.step = "wake_cut";
  }

  beginWake(): void {
    this.phase = "WAKE";
    this.step = "wake";
  }

  getResult(): VerdictCode | undefined {
    const r = this.answers.result;
    return typeof r === "string" ? (r as VerdictCode) : undefined;
  }
}

export const flow = new InterrogationFlow();
