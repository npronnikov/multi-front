# Tasks: Add Version Button

## Phase 1: Подготовка структуры

- [x] T001 — Добавить импорт версии из package.json в компонент page.tsx (`multi-front/app/page.tsx`)
- [x] T002 — Добавить состояние useState для управления отображением версии в page.tsx (`multi-front/app/page.tsx`)
- [x] T003 — Создать компонент кнопки version с функционалом переключения в page.tsx (`multi-front/app/page.tsx`)
- [x] T004 — Добавить стилизацию кнопки с использованием Tailwind CSS в page.tsx (`multi-front/app/page.tsx`)

## Phase 2: Интеграция в UI

- [x] T005 — Разместить кнопку version рядом с заголовком "Todo List" в page.tsx (`multi-front/app/page.tsx`)
- [x] T006 — Проверить визуальную согласованность с существующим дизайном (отступы, размеры, цвета) (`multi-front/app/page.tsx`)

## Phase 3: Тестирование функциональности

- [x] T007 — Проверить отображение кнопки на главной странице (`multi-front/app/page.tsx`)
- [x] T008 — Проверить переключение между текстом "version" и версией при нажатии (`multi-front/app/page.tsx`)
- [x] T009 — Проверить корректность отображения версии из package.json (`multi-front/app/page.tsx`)

## Verification

- [x] T010 — Запустить сборку frontend: `cd multi-front && npm run build`
- [x] T011 — Проверить отсутствие TypeScript ошибок: `cd multi-front && npx tsc --noEmit`
- [x] T012 — Проверить стили: `cd multi-front && npm run lint` (если доступно)
