# Game for Digital Bridge — Допрос / Кошмар инспектора

Phaser 3 + TypeScript + Vite PWA  
Стенд Digital Bridge · планшет / kiosk

Прод-логика теста: [sber-invest.kz/services/taxreturn/test](https://sber-invest.kz/services/taxreturn/test)

## Запуск

```bash
npm install
npm run kiosk    # http://0.0.0.0:8080 — для планшета в сети
# или
npm run dev
```

Сборка:

```bash
npm run build
npm run preview
```

## Что это

Не лендинг — **игровая оболочка** поверх decision tree:

- сцены Phaser: Title → Interrogation → Verdict → WakeCut → Wake / Abort
- лампа с heat (cold→boil), кино-кадр с Айжан и роботом, shake, stamp particles, idle-abort
- touch-кнопки большого размера под планшет
- вертикальный планшет 720×1280 (9:16), мультяшный кино-кадр; fullscreen только с `?kiosk=1`
- PWA offline fallback (vite-plugin-pwa)
- аналитика в `localStorage` + опциональный `?api=` / `window.__ANALYTICS_URL`
- консоль стенда: `window.__stats()`

## Структура

| Путь | Роль |
|------|------|
| `src/logic/tree.ts` | 8 исходов, реплики, LINKS |
| `src/logic/flow.ts` | стейт-машина допроса |
| `src/scenes/*` | игровые сцены |
| `src/objects/*` | кино-кадр, лампа, бумага, кнопки |
| `src/analytics/*` | метрики |
| `docs/` | спека #4 + библия персонажа |
| `archive/dom-prototype/` | старый DOM-прототип |

## Документы

- [docs/04-interrogation-nightmare-spec.md](docs/04-interrogation-nightmare-spec.md)
- [docs/05-character-bible-inspector.md](docs/05-character-bible-inspector.md)
