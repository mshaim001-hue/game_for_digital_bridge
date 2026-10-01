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
  { id: "sp_gov", label: "Госслужащий" },
  { id: "sp_ceo", label: "Руководитель юридического лица" },
  { id: "sp_share", label: "Учредитель / акционер >10%" },
  { id: "sp_notary", label: "Частный нотариус" },
  { id: "sp_csi", label: "Частный судебный исполнитель" },
  { id: "sp_mediator", label: "Профессиональный медиатор" },
];

const MONEY_ABROAD_TIP =
  "Деньги на счетах и депозитах в иностранных банках: совокупная сумма на 31 декабря 2025 года превышает 1 000 МРП — 3 932 000 ₸. Деньги на иностранных брокерских счетах рассматриваются отдельно: банковский порог 1 000 МРП к ним не применяется.";

const PROPERTY_ABROAD_TIP =
  "Недвижимость и транспорт за рубежом; ценные бумаги иностранных эмитентов, в том числе приобретённые через KASE или AIX; инвестиционное золото за рубежом; доли в иностранных юридических лицах; доли участия в жилищном строительстве за рубежом.";

const BROKER_TIP =
  "Счёт у иностранного брокера, на котором были деньги или активы либо по которому вы получали доходы. Для определения обязанностей важно уточнить состав активов, остатки и операции.";

const CRYPTO_TIP =
  "Криптовалюта и другие цифровые активы в вашей собственности. Учитываются активы на биржах и в кошельках независимо от страны платформы.";

export const ASSET_ITEMS: ChipItem[] = [
  {
    id: "income",
    label: "Доходы от аренды, продажи имущества, инвестиций или из-за рубежа",
    hot: true,
    foreign: false,
    tipTitle: "Доходы",
    tip:
      "Например: доход от аренды квартиры, продажи недвижимости, транспорта, ценных бумаг или криптовалюты; зарубежная зарплата, дивиденды, купоны, проценты по иностранным депозитам; доход от личного подсобного хозяйства.",
  },
  {
    id: "deal",
    label: "Покупки имущества за 2025 год на общую сумму свыше 78,64 млн ₸",
    hot: true,
    foreign: false,
    tipTitle: "Крупные покупки",
    tip:
      "Учитываются приобретения в Казахстане и за рубежом общей стоимостью свыше 20 000 МРП — 78,64 млн ₸ за 2025 год. В перечень входят недвижимость, транспорт, доли в компаниях, ценные бумаги и другие предусмотренные законом виды имущества. Продажи проверяются отдельно.",
  },
  {
    id: "money_abroad",
    label: "Деньги на счетах за рубежом",
    hot: true,
    foreign: true,
    tipTitle: "Деньги за рубежом",
    tip: MONEY_ABROAD_TIP,
  },
  {
    id: "property_abroad",
    label: "Имущество за рубежом",
    hot: true,
    foreign: true,
    tipTitle: "Имущество за рубежом",
    tip: PROPERTY_ABROAD_TIP,
  },
  {
    id: "debt_abroad",
    label: "Долги или займы с юридическими или физическими лицами",
    hot: true,
    foreign: true,
    tipTitle: "Долги или займы с юридическими или физическими лицами",
    tip:
      "Долги или займы физическим или юридическим лицам. Кроме краундфандинговых платформ, зарегистрированных в МФЦА.",
  },
  {
    id: "crypto",
    label: "Криптовалюта / цифровые активы",
    hot: true,
    foreign: true,
    tipTitle: "Криптовалюта / цифровые активы",
    tip: CRYPTO_TIP,
  },
];

export const SPOUSE_FOREIGN_ASSETS: ChipItem[] = [
  {
    id: "sp_money",
    label: "Деньги на счетах за рубежом",
    hot: true,
    foreign: true,
    tipTitle: "Деньги за рубежом",
    tip: MONEY_ABROAD_TIP,
  },
  {
    id: "sp_property",
    label: "Имущество за рубежом",
    hot: true,
    foreign: true,
    tipTitle: "Имущество за рубежом",
    tip: PROPERTY_ABROAD_TIP,
  },
  {
    id: "sp_broker",
    label: "Иностранный брокерский счёт",
    hot: true,
    foreign: true,
    tipTitle: "Иностранный брокерский счёт",
    tip: BROKER_TIP,
  },
  {
    id: "sp_crypto",
    label: "Криптовалюта / цифровые активы",
    hot: true,
    foreign: true,
    tipTitle: "Криптовалюта / цифровые активы",
    tip: CRYPTO_TIP,
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
      "По ответам на вопросы теста резидентство не подтверждено. Для вывода о декларации нужно уточнить ваш статус и обстоятельства.",
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
      "По вашим ответам возможны основания для подачи ФНО 270 за 2025 год. Необходимость ФНО 250 следует проверить отдельно.",
  },
  r_spouse_only270: {
    code: "r_spouse_only270",
    finale: "WATCH",
    badge: "WATCH · ФНО 270",
    legal:
      "Вы указали статус супруга(и) и предыдущую подачу ФНО 250. Нужно проверить обязанность по ФНО 270 за 2025 год с учётом вашего статуса.",
  },
  r_spouse_no250: {
    code: "r_spouse_no250",
    finale: "WATCH",
    badge: "WATCH · ФНО 270",
    legal:
      "Вы указали статус супруга(и), который может влиять на подачу ФНО 270 за 2025 год. Отсутствие зарубежных активов само по себе не завершает проверку.",
  },
  r_mandatory: {
    code: "r_mandatory",
    finale: "ALERT",
    badge: "ALERT · ФНО 270 + 250",
    legal:
      "Указанный вами статус может создавать обязанность по декларированию. Нужно уточнить, какие формы требуются за соответствующий период и какие уже поданы.",
  },
  r_spouse_need250: {
    code: "r_spouse_need250",
    finale: "ALERT",
    badge: "ALERT · ФНО 270 + 250",
    legal:
      "Статус супруга(и), указанные активы и отсутствие ранее поданной ФНО 250 требуют проверки обязанностей по формам 250 и 270.",
  },
  r_both: {
    code: "r_both",
    finale: "ALERT",
    badge: "ALERT · ФНО 270 + 250",
    legal:
      "По вашим ответам нужно проверить обязанности по формам 250 и 270. Уточним состав активов, отчётный период и предыдущие декларации.",
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
      "Если так, то до 15 сентября вам нужно было подать декларацию!\n\nПодавали?\n\nНасколько вы добросовестный налогоплательщик? 😏",
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
      "Если так, то до 15 сентября вам нужно было подать декларацию!\n\nПодавали?\n\nНасколько вы добросовестный налогоплательщик? 😏",
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
      "Пока чисто. По вашим ответам оснований не вижу.",
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
    speech: ["Если так, то декларацию подавать не нужно!"],
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
  aizhan: "https://t.me/aizhan_sberbot",
  telegram: "https://t.me/sberinvest",
  products: "https://sber-invest.kz/",
} as const;

/** Protocol card, then the last screen that follows it. */
export type ProtocolCard = {
  headline: string;
  body: string;
  wake: string;
  link: string;
  href: string;
  qr: "qr_aizhan" | "qr_telegram";
};

const WAKE_FREE =
  "Похоже, вам пока нечего декларировать. А время идёт… 😏\n\nВозможно, это повод задуматься и прокачать свою финансовую грамотность. Начать можно с простого:";
const WAKE_FREE_LINK =
  "👉 Подпишитесь на Telegram-канал проекта и изучите контент.";
const WAKE_FILE =
  "Не знаете, с чего начать? Запишитесь на бесплатную консультацию со специалистом через";
const WAKE_FILE_LINK = "AI-Zhan";

export const PROTOCOL: Record<Finale, ProtocolCard> = {
  OUT: {
    headline: "Декларация не нужна",
    body: "Вы не являетесь налоговым резидентом РК\n\nВсеобщее декларирование на вас не распространяется — декларацию в его рамках подавать не нужно.",
    wake: WAKE_FREE,
    link: WAKE_FREE_LINK,
    href: LINKS.telegram,
    qr: "qr_telegram",
  },
  CLEAR: {
    headline: "Декларация не нужна",
    body: "Декларацию подавать не нужно\n\nПо результатам проверки оснований для подачи декларации в рамках всеобщего декларирования не обнаружено.",
    wake: WAKE_FREE,
    link: WAKE_FREE_LINK,
    href: LINKS.telegram,
    qr: "qr_telegram",
  },
  WATCH: {
    headline: "Подаётся только ФНО 270 — ежегодно",
    body: "ФНО 250 подавать не нужно, так как она уже подавалась ранее.",
    wake: WAKE_FILE,
    link: WAKE_FILE_LINK,
    href: LINKS.aizhan,
    qr: "qr_aizhan",
  },
  ALERT: {
    headline: "Вы обязаны подавать декларацию",
    body: "ФНО 270 — ежегодно. ФНО 250 — если ещё не подавалась ранее или по требованию налогового органа.",
    wake: WAKE_FILE,
    link: WAKE_FILE_LINK,
    href: LINKS.aizhan,
    qr: "qr_aizhan",
  },
};

export const MICRO = {
  resident_check: "Хм. Тогда уточним статус до конца.",
  mandatory: "Так. Это меняет дело.",
  foreign: "Есть контакт.",
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
