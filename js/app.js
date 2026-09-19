import {
  MANDATORY_CATEGORIES,
  ASSET_ITEMS,
  SPOUSE_FOREIGN_ASSETS,
  VERDICTS,
  FINALE_SHELL,
  INTRO_SPEECH,
  LINKS,
  MICRO,
} from "./tree.js";

const app = document.getElementById("app");

const state = {
  game: "IDLE",
  step: "e0",
  wave: 0,
  heat: "cold",
  answers: {},
  selected: new Set(),
  resumeStep: null,
  showIntro: true,
};

function setHeat(level) {
  if (!level) return;
  const order = { cold: 0, warm: 1, hot: 2, boil: 3 };
  if ((order[level] || 0) >= (order[state.heat] || 0)) state.heat = level;
}

function go(step, { reaction, heat } = {}) {
  state.step = step;
  if (heat) setHeat(heat);
  if (reaction) {
    showReaction(reaction, () => render());
  } else {
    render();
  }
}

function showReaction(text, done) {
  const el = document.getElementById("reaction");
  const label = document.getElementById("reaction-text");
  if (!el || !label) {
    done();
    return;
  }
  label.textContent = text;
  el.classList.add("is-on");
  document.getElementById("room")?.classList.add("flash");
  window.setTimeout(() => {
    el.classList.remove("is-on");
    document.getElementById("room")?.classList.remove("flash");
    done();
  }, 650);
}

function reset() {
  Object.assign(state, {
    game: "IDLE",
    step: "e0",
    wave: 0,
    heat: "cold",
    answers: {},
    selected: new Set(),
    resumeStep: null,
    showIntro: true,
  });
  render();
}

function abort() {
  if (state.game !== "INTERROGATION") return;
  state.resumeStep = state.step;
  state.game = "ABORTED";
  state.step = "abort";
  render();
}

function resume() {
  state.game = "INTERROGATION";
  state.step = state.resumeStep || "q1_1";
  render();
}

function start() {
  state.game = "INTERROGATION";
  state.wave = 1;
  state.heat = "cold";
  state.answers = {};
  state.selected = new Set();
  state.showIntro = true;
  go("q1_1");
}

function resolve(code, opts = {}) {
  state.answers.result = code;
  const v = VERDICTS[code];
  if (v.finale === "ALERT") setHeat("boil");
  else if (v.finale === "WATCH") setHeat("hot");

  const finish = () => {
    state.game = "VERDICT_DREAM";
    state.step = "verdict";
    render();
  };
  if (opts.reaction) showReaction(opts.reaction, finish);
  else finish();
}

function toWakeCut() {
  state.game = "WAKE";
  state.step = "wake_cut";
  render();
  window.setTimeout(() => {
    state.step = "wake";
    render();
  }, 1100);
}

function onYesNo(qid, yes) {
  state.answers[qid] = yes;

  if (qid === "q1_1") {
    if (yes) {
      state.wave = 2;
      go("q2_1", { reaction: MICRO.resident_yes, heat: "warm" });
    } else {
      go("q1_2", { reaction: MICRO.resident_check });
    }
    return;
  }
  if (qid === "q1_2") {
    if (yes) {
      state.wave = 2;
      go("q2_1", { reaction: MICRO.resident_yes, heat: "warm" });
    } else go("q1_3");
    return;
  }
  if (qid === "q1_3") {
    if (yes) {
      state.wave = 2;
      go("q2_1", { reaction: MICRO.resident_yes, heat: "warm" });
    } else resolve("r_not_resident");
    return;
  }
  if (qid === "q2_2") {
    if (yes) {
      go("q2_2_f250", { reaction: MICRO.spouse, heat: "hot" });
    } else {
      state.wave = 3;
      go("q2_3");
    }
    return;
  }
  if (qid === "q2_2_f250") {
    if (yes) resolve("r_spouse_only270");
    else {
      state.selected = new Set();
      go("q2_2_assets");
    }
    return;
  }
  if (qid === "q2_3_f250") {
    const assets = state.answers.q2_3_items || [];
    const hasForeign = assets.some((id) =>
      ASSET_ITEMS.find((a) => a.id === id && a.foreign)
    );
    resolve(yes ? "r_only270" : hasForeign ? "r_both" : "r_only270");
  }
}

function confirmChips(stepId) {
  const ids = [...state.selected];
  if (stepId === "q2_1") {
    state.answers.q2_1 = ids;
    if (ids.length > 0) {
      setHeat("hot");
      resolve("r_mandatory", { reaction: MICRO.mandatory });
    } else go("q2_2");
    return;
  }
  if (stepId === "q2_2_assets") {
    state.answers.q2_2_assets = ids;
    if (ids.length > 0) {
      resolve("r_spouse_need250", { reaction: MICRO.foreign });
      setHeat("hot");
    } else resolve("r_spouse_no250", { reaction: MICRO.empty });
    return;
  }
  if (stepId === "q2_3") {
    state.answers.q2_3_items = ids;
    if (ids.length === 0) {
      resolve("r_none", { reaction: MICRO.empty });
    } else {
      if (ids.some((id) => ASSET_ITEMS.find((a) => a.id === id && a.foreign))) {
        setHeat("hot");
        go("q2_3_f250", { reaction: MICRO.foreign, heat: "hot" });
      } else {
        go("q2_3_f250");
      }
    }
  }
}

/* ——— Render helpers ——— */

function inspectorSVG() {
  const face =
    state.heat === "boil"
      ? "boil"
      : state.heat === "hot"
        ? "brow"
        : "neutral";
  return `
    <div class="inspector heat-${state.heat}" data-face="${face}">
      <div class="insp-hair"></div>
      <div class="insp-head">
        <div class="insp-glasses"></div>
        <div class="insp-eyes"></div>
        <div class="insp-brow"></div>
        <div class="insp-mouth"></div>
      </div>
      <div class="insp-body">
        <div class="insp-collar"></div>
        <div class="insp-badge">Айжан Н.</div>
      </div>
      <div class="insp-folder"></div>
    </div>`;
}

function roomChrome() {
  const waves = ["Резидент", "Обязательные", "Активы"];
  const stamps = [1, 2, 3]
    .map(
      (n) =>
        `<span class="stamp ${state.wave >= n ? "on" : ""}">${waves[n - 1] || ""}</span>`
    )
    .join("");
  return `
    <div class="case-bar">
      <span class="case-title">Дело · Инспектор Айжан Н.</span>
      <div class="stamps">${stamps}</div>
      <button type="button" class="btn-abort" data-action="abort" ${
        state.game !== "INTERROGATION" ? "hidden" : ""
      }>Прервать</button>
    </div>`;
}

function renderE0() {
  return `
    <section class="screen screen-start">
      <div class="alarm-teaser" aria-hidden="true">
        <div class="alarm-face">6:00</div>
      </div>
      <p class="eyebrow">Digital Bridge · стенд</p>
      <h1>Тебе приснится это…</h1>
      <p class="lede">Короткий допрос по мотивам реального теста. Узнаешь, нужен ли тебе сон спокойнее.</p>
      <button type="button" class="btn-primary btn-xl" data-action="start">Начать допрос</button>
      <p class="fine">~1–2 мин · юридическая логика = прод-тест</p>
    </section>`;
}

function qShell(inner) {
  const intro = state.showIntro
    ? `<p class="speech intro-speech">«${INTRO_SPEECH}»</p>`
    : "";
  if (state.showIntro) {
    // show once then clear on next paint cycle via flag after first question render
    queueMicrotask(() => {
      state.showIntro = false;
    });
  }
  return `
    <section class="screen screen-room" id="room">
      ${roomChrome()}
      <div class="room-stage">
        <div class="lamp ${state.heat}"><div class="lamp-cone"></div></div>
        <div class="table-scene">
          ${inspectorSVG()}
          <div class="player-hands" aria-hidden="true"></div>
        </div>
        <div class="q-panel">
          ${intro}
          ${inner}
        </div>
      </div>
    </section>`;
}

function renderYesNo({ title, hint, qid }) {
  return qShell(`
    <p class="from-her">Инспектор спрашивает:</p>
    <h2>${title}</h2>
    ${hint ? `<p class="hint">${hint}</p>` : ""}
    <div class="btn-row">
      <button type="button" class="btn-choice" data-yn="yes" data-q="${qid}">Да</button>
      <button type="button" class="btn-choice btn-no" data-yn="no" data-q="${qid}">Нет</button>
    </div>`);
}

function renderChips({ title, hint, items, stepId }) {
  const chips = items
    .map(
      (it) =>
        `<button type="button" class="chip ${
          state.selected.has(it.id) ? "is-on" : ""
        }" data-chip="${it.id}">${it.label}</button>`
    )
    .join("");
  return qShell(`
    <p class="from-her">Инспектор открывает папку:</p>
    <h2>${title}</h2>
    ${hint ? `<p class="hint">${hint}</p>` : ""}
    <div class="chip-grid">${chips}</div>
    <div class="btn-row stack">
      <button type="button" class="btn-primary" data-action="confirm" data-step="${stepId}">Отметить в деле</button>
      <button type="button" class="btn-ghost" data-action="none" data-step="${stepId}">Ничего из этого</button>
    </div>`);
}

function renderVerdict() {
  const v = VERDICTS[state.answers.result];
  const shell = FINALE_SHELL[v.finale];
  const lines = shell.speech.map((l) => `<p>«${l}»</p>`).join("");
  const nightmare =
    v.finale === "ALERT" || v.finale === "WATCH"
      ? `<div class="nightmare-tags"><span>Штраф</span><span>Пеня</span><span>Счета</span></div>`
      : "";
  const lampOut = v.finale === "OUT" ? "lamp-out" : "";

  return `
    <section class="screen screen-verdict heat-${shell.heat} ${lampOut}">
      <div class="verdict-stage">
        ${inspectorSVG()}
        <div class="speech-block">${lines}</div>
        ${nightmare}
        <div class="legal-card">
          <p class="legal-label">${v.badge}</p>
          <p>${v.legal}</p>
        </div>
        <button type="button" class="btn-primary btn-xl" data-action="wake">…</button>
        <p class="fine">коснись, чтобы проснуться</p>
      </div>
    </section>`;
}

function renderWakeCut() {
  return `
    <section class="screen screen-wake-cut">
      <div class="glitch">БЗЗЗЗ</div>
      <p class="alarm-ring">6:00</p>
    </section>`;
}

function renderWake() {
  const v = VERDICTS[state.answers.result];
  const shell = FINALE_SHELL[v.finale];
  const url = LINKS[shell.ctaAction] || LINKS.soft_qr;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    url
  )}`;

  return `
    <section class="screen screen-wake">
      <p class="eyebrow">Утро · пробуждение</p>
      <h1>${shell.wakeTitle}</h1>
      <p class="lede">${shell.wakeSub}</p>
      <div class="legal-card soft">
        <p class="legal-label">${v.badge}</p>
        <p>${v.legal}</p>
      </div>
      <div class="cta-block">
        <div class="qr-wrap">
          <img src="${qr}" width="140" height="140" alt="QR" />
          <p class="fine">Наведите камеру</p>
        </div>
        <div class="cta-actions">
          <a class="btn-primary btn-xl" href="${url}" target="_blank" rel="noopener">${shell.ctaPrimary}</a>
          <button type="button" class="btn-ghost" data-action="secondary" data-sec="${shell.ctaSecAction}">${shell.ctaSecondary}</button>
          <button type="button" class="btn-ghost" data-action="restart">Пройти допрос снова</button>
        </div>
      </div>
    </section>`;
}

function renderAbort() {
  return `
    <section class="screen screen-abort">
      <div class="finale-badge">Прервано</div>
      <h1>Допрос прерван — вердикт неполный</h1>
      <p class="lede">Без полного дела нельзя сказать, нужна ли декларация.</p>
      <div class="btn-row">
        <button type="button" class="btn-primary btn-xl" data-action="resume">Продолжить</button>
        <button type="button" class="btn-ghost" data-action="restart">Сначала</button>
      </div>
    </section>`;
}

function stageContent() {
  switch (state.step) {
    case "e0":
      return renderE0();
    case "q1_1":
      return renderYesNo({
        title: "Вы являетесь гражданином Республики Казахстан?",
        hint: "Гражданство РК.",
        qid: "q1_1",
      });
    case "q1_2":
      return renderYesNo({
        title: "Пребывали ли вы в РК более 183 дней?",
        hint: "Срок пребывания.",
        qid: "q1_2",
      });
    case "q1_3":
      return renderYesNo({
        title: "Центр жизненных интересов — в Республике Казахстан?",
        hint: "Семья, имущество, деятельность.",
        qid: "q1_3",
      });
    case "q2_1":
      return renderChips({
        title: "Относитесь ли вы к обязательным категориям?",
        hint: "Глава дела: Обязательные.",
        items: MANDATORY_CATEGORIES,
        stepId: "q2_1",
      });
    case "q2_2":
      return renderYesNo({
        title: "Супруг(а) относится к обязательным категориям?",
        qid: "q2_2",
      });
    case "q2_2_f250":
      return renderYesNo({
        title: "Подавали ли вы ФНО 250 ранее?",
        qid: "q2_2_f250",
      });
    case "q2_2_assets":
      return renderChips({
        title: "Есть ли зарубежные активы?",
        items: SPOUSE_FOREIGN_ASSETS,
        stepId: "q2_2_assets",
      });
    case "q2_3":
      return renderChips({
        title: "Есть ли другие основания?",
        hint: "Глава дела: Активы / доходы.",
        items: ASSET_ITEMS,
        stepId: "q2_3",
      });
    case "q2_3_f250":
      return renderYesNo({
        title: "Подавали ли вы ФНО 250 ранее?",
        qid: "q2_3_f250",
      });
    case "verdict":
      return renderVerdict();
    case "wake_cut":
      return renderWakeCut();
    case "wake":
      return renderWake();
    case "abort":
      return renderAbort();
    default:
      return renderE0();
  }
}

function render() {
  app.innerHTML = `
    <main class="stage" id="stage">${stageContent()}</main>
    <div class="reaction" id="reaction"><p id="reaction-text"></p></div>
  `;
  app.dataset.heat = state.heat;
  app.dataset.game = state.game;
}

app.addEventListener("click", (e) => {
  const t = /** @type {HTMLElement} */ (e.target);
  const el = t.closest("[data-action], [data-yn], [data-chip]");
  if (!el) return;

  const action = el.getAttribute("data-action");
  if (action === "start") {
    start();
    return;
  }
  if (action === "abort") {
    abort();
    return;
  }
  if (action === "resume") {
    resume();
    return;
  }
  if (action === "restart") {
    reset();
    return;
  }
  if (action === "wake") {
    toWakeCut();
    return;
  }
  if (action === "confirm") {
    confirmChips(el.getAttribute("data-step"));
    return;
  }
  if (action === "none") {
    state.selected = new Set();
    confirmChips(el.getAttribute("data-step"));
    return;
  }
  if (action === "secondary") {
    const sec = el.getAttribute("data-sec");
    if (sec === "restart") {
      reset();
      return;
    }
    window.open(LINKS[sec] || LINKS.ai, "_blank", "noopener");
    return;
  }

  if (el.hasAttribute("data-yn")) {
    onYesNo(el.getAttribute("data-q"), el.getAttribute("data-yn") === "yes");
    return;
  }
  if (el.hasAttribute("data-chip")) {
    const id = el.getAttribute("data-chip");
    if (state.selected.has(id)) state.selected.delete(id);
    else state.selected.add(id);
    render();
  }
});

let idle;
function bumpIdle() {
  clearTimeout(idle);
  if (state.game !== "INTERROGATION") return;
  idle = setTimeout(() => abort(), 120000);
}
["pointerdown", "keydown"].forEach((ev) =>
  document.addEventListener(ev, bumpIdle, { passive: true })
);

render();
