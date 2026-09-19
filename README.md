# Game for Digital Bridge — Допрос / Кошмар инспектора

Геймификация теста «Нужно ли вам сдавать декларацию?»  
Прод-логика: [sber-invest.kz/services/taxreturn/test](https://sber-invest.kz/services/taxreturn/test)

## Актуальный концепт

**«Допрос / Кошмар инспектора»** — персонаж Айжан Н., лампа, допрос → кошмарный вердикт → пробуждение с QR.

Дерево вопросов и **8 юридических исходов не менять**. Меняется только оболочка.

## Запуск прототипа

```bash
cd game_for_digital_bridge
python3 -m http.server 8080
```

Открыть: [http://localhost:8080](http://localhost:8080)

## Цикл

Старт → комната допроса → вопросы как допрос → вердикт в кошмаре → будильник → пробуждение + **QR «Подай декларацию — и спи спокойно»** (WATCH/ALERT).

## Документы

| Файл | Зачем |
|------|--------|
| [docs/04-interrogation-nightmare-spec.md](docs/04-interrogation-nightmare-spec.md) | Спека стенда |
| [docs/05-character-bible-inspector.md](docs/05-character-bible-inspector.md) | Библия персонажа + реплики |
| [docs/01-current-test-analysis.md](docs/01-current-test-analysis.md) | Дерево (не ломать) |

## Код

| Файл | Роль |
|------|------|
| `index.html` | Entry |
| `css/styles.css` | Комната / лампа / утро |
| `js/tree.js` | Дерево + реплики + LINKS |
| `js/app.js` | Стейт-машина E0–E5 |

URL QR/CTA: `LINKS` в `js/tree.js`.
