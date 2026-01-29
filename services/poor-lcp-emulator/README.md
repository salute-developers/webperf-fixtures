# Speed LCP Emulator

Сайт для эмуляции задержки LCP через query параметры.

## Query параметры

- `LCP`: задержка в миллисекундах (например, `?LCP=3000`)
- `mode`: `image` (по умолчанию) или `server` (например, `?LCP=3000&mode=server`)

## Режимы

- `image`: LCP задерживается через задержку ответа `GET /api/image?delay=...`
- `server`: LCP задерживается через server-side задержку рендера страницы
