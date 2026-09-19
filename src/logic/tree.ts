/** Decision tree — same as prod test. Shell: Interrogation Nightmare (#4) */

export type Heat = "cold" | "warm" | "hot" | "boil";
export type Finale = "OUT" | "CLEAR" | "WATCH" | "ALERT";
export type VerdictCode =
  | "r_not_resident"
  | "r_none"
  | "r_only270"
  | "r_spouse_only270"
  | "r_spouse_no250"
  | "r_mandatory"
  | "r_spouse_need250"
  | "r_both";

export type ChipItem = {
  id: string;
  label: string;
  hot?: boolean;
  foreign?: boolean;
  tipTitle?: string;
  tip?: string;
};

export const MANDATORY_CATEGORIES: ChipItem[] = [
  { id: "gov", label: "Госслужащий" },
  { id: "ceo", label: "Руководитель юридического лица" },
  { id: "share", label: "Учредитель / акционер >10%" },
  { id: "notary", label: "Частный нотариус" },
  { id: "csi", label: "Частный судебный исполнитель" },
  { id: "mediator", label: "Профессиональный медиатор" },
];

export const SPOUSE_MANDATORY_CATEGORIES: ChipItem[] = [
  { id: "sp_gov", label: "Государственный служащий" },
  { id: "sp_ceo", label: "Руководитель юридического лица" },
  {
    id: "sp_founder",
    label: "Учредитель юридического лица с долей более 10%",
  },
  {
    id: "sp_shareholder",
    label: "Акционер, владеющий более 10% акций",
  },
];

export const ASSET_ITEMS: ChipItem[] = [
  {
    id: "income",
    label: "Доход, с которого вы сами должны заплатить налог",
    hot: true,
    foreign: false,
    tipTitle: "Доход, с которого вы сами должны заплатить налог",
    tip:
      "Доход от продажи недвижимости, транспорта, ценных бумаг, криптовалюты; зарубежный доход (зарплата, дивиденды, купоны, проценты по иностранным депозитам); доход от личного подсобного хозяйства; доход от аренды квартиры без статуса ИП.",
  },
  {
    id: "deal",
    label: "Покупка или продажа имущества дороже 78 млн ₸",
    hot: true,
    foreign: false,
    tipTitle: "Покупка или продажа имущества дороже 78 млн ₸",
    tip:
      "Сделка с имуществом, подлежащим государственной регистрации — в РК или за рубежом — на сумму свыше 20 000 МРП в отчётном периоде.",
  },
  {
    id: "money_abroad",
    label: "Деньги на счетах за рубежом",
    hot: true,
    foreign: true,
    tipTitle: "Деньги за рубежом",
    tip:
      "Совокупный остаток на счетах/депозитах в иностранных банках более 1 000 МРП (≈ 4 млн ₸), или любая сумма на иностранных брокерских счетах.",
  },
  {
    id: "property_abroad",
    label: "Имущество за рубежом",
    hot: true,
    foreign: true,
    tipTitle: "Имущество за рубежом",
    tip:
      "Недвижимость, транспорт, иностранные ценные бумаги (акции, облигации, ETF — даже купленные через KASE или AIX), криптовалюта, инвестиционное золото, доли в уставном капитале иностранных юрлиц, участие в зарубежных строительных проектах.",
  },
  {
    id: "debt_abroad",
    label: "Долги или займы с людьми/компаниями за рубежом",
    hot: true,
    foreign: true,
    tipTitle: "Долги или займы с людьми/компаниями за рубежом",
    tip: "Займы или кредиты, выданные или полученные за пределами РК.",
  },
];

export const SPOUSE_FOREIGN_ASSETS: ChipItem[] = [
  {
    id: "sp_money",
    label: "Деньги на счетах за рубежом",
    hot: true,
    foreign: true,
    tipTitle: "Деньги за рубежом",
    tip:
      "Совокупный остаток на счетах/депозитах в иностранных банках более 1 000 МРП (≈ 4 млн ₸), или любая сумма на иностранных брокерских счетах.",
  },
  {
    id: "sp_property",
    label: "Имущество за рубежом",
    hot: true,
    foreign: true,
    tipTitle: "Имущество за рубежом",
    tip:
      "Недвижимость, транспорт, иностранные ценные бумаги (акции, облигации, ETF — даже купленные через KASE или AIX), криптовалюта, инвестиционное золото, доли в уставном капитале иностранных юрлиц, участие в зарубежных строительных проектах.",
  },
  {
    id: "sp_broker",
    label: "Иностранный брокерский счёт",
    hot: true,
    foreign: true,
    tipTitle: "Иностранный брокерский счёт",
    tip:
      "Любой счёт у иностранного брокера: ценные бумаги, ETF, криптовалюта или остаток денег — даже если сумма небольшая.",
  },
];

export type Verdict = {
  code: VerdictCode;
  finale: Finale;
  badge: string;
  legal: string;
};

export const VERDICTS: Record<VerdictCode, Verdict> = {
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

export type FinaleShell = {
  speech: string[];
  wakeTitle: string;
  wakeSub: string;
  ctaPrimary: string;
  ctaAction: keyof typeof LINKS | "restart";
  ctaSecondary: string;
  ctaSecAction: keyof typeof LINKS | "restart";
  heat: Heat;
};

export const FINALE_SHELL: Record<Finale, FinaleShell> = {
  ALERT: {
    speech: [
      "Ага, вы обязаны отчитаться! Где ваша декларация? Вы её подали?",
      "Не знали? Незнание закона не освобождает от ответственности.",
      "Если игнорировать обязанность, вас могут ждать штраф, пеня и заблокированные счета.",
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
      "Проспите срок — штраф, пеня и заблокированные счета.",
      "Я бы на вашем месте подготовилась бы заранее.",
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
  "Свет не слишком яркий?\nХорошо. Давайте разберёмся.\nДля начала один простой вопрос.";

export const LINKS = {
  soft_qr: "https://sber-invest.kz/services/taxreturn",
  hard_cta: "https://sber-invest.kz/services/taxreturn",
  ai: "https://sber-invest.kz/",
  telegram: "https://t.me/sberinvest",
  products: "https://sber-invest.kz/",
} as const;

export const MICRO = {
  resident_check: "Хм. Тогда уточним статус до конца.",
  mandatory: "Так. Это меняет дело.",
  foreign: "Сигнал есть.",
  empty: "Пока пусто. Идём дальше.",
  spouse: "Супруг(а) в деле. Продолжаем.",
} as const;

export const HEAT_ORDER: Record<Heat, number> = {
  cold: 0,
  warm: 1,
  hot: 2,
  boil: 3,
};

export function maxHeat(a: Heat, b: Heat): Heat {
  return HEAT_ORDER[a] >= HEAT_ORDER[b] ? a : b;
}

export function needsDeclaration(code: VerdictCode): boolean {
  return !["r_not_resident", "r_none"].includes(code);
}
