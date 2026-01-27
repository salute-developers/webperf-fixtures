# webperf-fixtures

Набор учебных «плохих» сайтов для воспроизведения проблем с Web Vitals.
Это монорепозиторий на Turbo с несколькими Next.js‑сервисами, которые
целенаправленно ухудшают метрики (CLS, INP, LCP) и управляются через
query‑параметры.

## Что внутри

- `services/poor-cls-emulator` — эмулятор плохого CLS (layout shift).
- `services/poor-inp-emulator` — эмулятор плохого INP (длинные задачи на main thread).
- `services/poor-lcp-emulator` — эмулятор плохого LCP (задержка LCP через image/server).

Подробные параметры и режимы — в README каждого сервиса.

## Быстрый старт

```bash
npm install
npm run dev
```

`npm run dev` поднимает все сервисы параллельно через Turbo.

## Запуск конкретного сервиса

```bash
npm --prefix services/poor-cls-emulator run dev
# или
npm --prefix services/poor-inp-emulator run dev
# или
npm --prefix services/poor-lcp-emulator run dev
```

## Скрипты в корне

- `dev` — запуск всех сервисов в dev-режиме
- `build` — сборка всех сервисов
- `lint` — lint по всем сервисам
- `test` — запуск тестовых скриптов сервисов

## Для чего это

- демонстрации и обучение web performance
- воспроизведение и анализ регрессий
- локальная отладка метрик Web Vitals
