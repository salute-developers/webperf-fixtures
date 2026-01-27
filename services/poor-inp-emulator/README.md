# Speed INP Emulator

Сайт для эмуляции плохого INP (Interaction to Next Paint) через query параметры.

Идея: на взаимодействие пользователя (pointerdown/click/keydown) мы создаём «длинную задачу» на main thread, из‑за чего
следующий paint откладывается, и INP становится плохим.

## Установка и запуск

```bash
npm install
npm run dev
```

## Query параметры

- `INP`: задержка в миллисекундах (например, `?INP=3000`)
- `mode`: режим эмуляции: `sync` (по умолчанию), `setTimeout`, `raf` (например, `?INP=3000&mode=sync`)

## Режимы

- `sync`: блокирует main thread прямо в обработчике события (обычно даёт «плохой» INP)
- `setTimeout`: откладывает результат, но не всегда делает INP таким же плохим (для сравнения)
- `raf`: блокирует в `requestAnimationFrame` ближе к кадру отрисовки
