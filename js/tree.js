/**
 * Decision tree — same as prod test.
 * Shell: Interrogation Nightmare (#4)
 */

export const MANDATORY_CATEGORIES = [
  { id: "gov", label: "Госслужащий" },
  { id: "ceo", label: "Руководитель юридического лица" },
  { id: "share", label: "Учредитель / акционер >10%" },
  { id: "notary", label: "Частный нотариус" },
  { id: "csi", label: "Частный судебный исполнитель" },
  { id: "mediator", label: "Профессиональный медиатор" },
];

export const ASSET_ITEMS = [
  {
    id: "income",
    label: "Доход, подлежащий самостоятельному налогообложению",
    hot: true,
    foreign: false,
  },
  {
    id: "deal",
    label: "Крупная сделка свыше 20 000 МРП",
    hot: true,
    foreign: false,
  },
  {
    id: "money_abroad",
    label: "Деньги на счетах за рубежом",
    hot: true,
    foreign: true,
  },
  {
    id: "property_abroad",
    label: "Имущество за рубежом (вкл. иностранные ЦБ, крипта)",
    hot: true,
    foreign: true,
  },
  {
    id: "debt_abroad",
    label: "Дебиторская / кредиторская задолженность за рубежом",
    hot: true,
    foreign: true,
  },
];

export const SPOUSE_FOREIGN_ASSETS = [
  {
    id: "sp_money",
    label: "Деньги на счетах за рубежом",
    hot: true,
    foreign: true,
  },
  {
    id: "sp_property",
    label: "Имущество за рубежом (вкл. ЦБ, крипта)",
    hot: true,
    foreign: true,
  },
  {
    id: "sp_broker",
    label: "Иностранный брокерский счёт",
    hot: true,
    foreign: true,
  },
];

export const VERDICTS = {
  r_not_resident: {
    code: "r_not_resident",
    finale: "OUT",
    badge: "OUT · не резидент",
    legal:
      "Вы не являетесь налоговым резидентом РК в рамках этого теста. Обязанность по всеобщему декларированию на вас не распространяется.",
  },
  r_none: {
    code: "r_none",
    finale: "CLEAR",
    badge: "CLEAR · оснований нет",
    legal:
      "По вашим ответам оснований для подачи декларации в рамках всеобщего декларирования не выявлено.",
  },
  r_only270: {
    code: "r_only270",
    finale: "WATCH",
    badge: "WATCH · ФНО 270",
    legal:
      "Вам нужно ежегодно подавать декларацию о доходах и имуществе (ФНО 270). ФНО 250 по текущим ответам не требуется.",
  },
  r_spouse_only270: {
    code: "r_spouse_only270",
    finale: "WATCH",
    badge: "WATCH · ФНО 270",
    legal:
      "Супруг(а) относится к обязательной категории, а ФНО 250 уже подавалась. Вам нужна ежегодная ФНО 270.",
  },
  r_spouse_no250: {
    code: "r_spouse_no250",
    finale: "WATCH",
    badge: "WATCH · ФНО 270",
    legal:
      "Супруг(а) в обязательной категории, зарубежных активов не указано. Нужна ежегодная ФНО 270.",
  },
  r_mandatory: {
    code: "r_mandatory",
    finale: "ALERT",
    badge: "ALERT · ФНО 270 + 250",
    legal:
      "Вы относитесь к обязательной категории. Нужна ежегодная ФНО 270, а также ФНО 250 — если ещё не подавали её ранее.",
  },
  r_spouse_need250: {
    code: "r_spouse_need250",
    finale: "ALERT",
    badge: "ALERT · ФНО 270 + 250",
    legal:
      "Супруг(а) в обязательной категории, ФНО 250 ещё не подавалась, указаны зарубежные активы. Нужны ФНО 270 и ФНО 250.",
  },
  r_both: {
    code: "r_both",
    finale: "ALERT",
    badge: "ALERT · ФНО 270 + 250",
    legal:
      "Есть основания для ежегодной ФНО 270 и для ФНО 250 (зарубежные активы при отсутствии ранее поданной 250).",
  },
};

/** Inspector lines + wake punchlines from character bible */
export const FINALE_SHELL = {
  ALERT: {
    speech: [
      "По фактам — вы обязаны были отчитаться.",
      "Не подали. Дальше по сценарию: штраф, пеня…",
      "…и блокировка счетов. Спокойной ночи.",
    ],
    wakeTitle: "Подай декларацию — и спи спокойно",
    wakeSub: "Это был предупреждающий сон. Действие — в QR.",
    ctaPrimary: "Записаться на консультацию",
    ctaAction: "hard_cta",
    ctaSecondary: "InvesTax / CryptoTax",
    ctaSecAction: "products",
    heat: "boil",
  },
  WATCH: {
    speech: [
      "Сигнал есть: ежегодная декларация.",
      "Проспите срок — тот же сон, только дороже: штраф, пеня, счета.",
      "Я бы на вашем месте не ждала второго раза.",
    ],
    wakeTitle: "Подай декларацию — и спи спокойно",
    wakeSub: "ФНО 270 на радаре. Не доводите до кошмара наяву.",
    ctaPrimary: "Подать со специалистом",
    ctaAction: "hard_cta",
    ctaSecondary: "Спросить AI-Zhan",
    ctaSecAction: "ai",
    heat: "hot",
  },
  CLEAR: {
    speech: [
      "Пока чисто. Оснований не вижу.",
      "Но если появятся доходы, активы или статусы из нашего списка —",
      "мы ещё увидимся. Можете идти.",
    ],
    wakeTitle: "Пока можно спать спокойно",
    wakeSub: "Сохрани этот статус — и следи за изменениями.",
    ctaPrimary: "Сохранить статус",
    ctaAction: "soft_qr",
    ctaSecondary: "Спросить AI-Zhan",
    ctaSecAction: "ai",
    heat: "cold",
  },
  OUT: {
    speech: [
      "Вы не наш клиент по статусу резидентства.",
      "В этой рамке всеобщее декларирование — не ваш кейс.",
    ],
    wakeTitle: "Не ваш кошмар",
    wakeSub: "Если есть сомнения по статусу — уточните. Без давления.",
    ctaPrimary: "Уточнить статус · AI-Zhan",
    ctaAction: "ai",
    ctaSecondary: "Пройти допрос снова",
    ctaSecAction: "restart",
    heat: "cold",
  },
};

export const INTRO_SPEECH =
  "Садитесь. Свет не мешает? Хорошо. Будем говорить только фактами. Вопрос первый.";

export const LINKS = {
  soft_qr: "https://sber-invest.kz/services/taxreturn",
  hard_cta: "https://sber-invest.kz/services/taxreturn",
  ai: "https://sber-invest.kz/",
  products: "https://sber-invest.kz/",
};

/** Temperature: cold | warm | hot | boil */
export function heatFromEvent(event) {
  switch (event) {
    case "resident_yes":
      return "warm";
    case "mandatory":
    case "foreign":
    case "hot_item":
      return "hot";
    case "alert_finale":
      return "boil";
    default:
      return null;
  }
}

export const MICRO = {
  resident_yes: "Принято. Вы в зоне внимания.",
  resident_check: "Хм. Тогда уточним статус до конца.",
  mandatory: "Так. Это меняет дело.",
  foreign: "Сигнал есть.",
  empty: "Пока пусто. Идём дальше.",
  spouse: "Супруг(а) в деле. Продолжаем.",
};
