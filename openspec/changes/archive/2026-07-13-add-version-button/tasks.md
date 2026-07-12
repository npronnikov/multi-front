# Tasks: Add Version Button

## Phase 1: Подготовка

- [x] T001 — Создать файл с константами для версий приложения (`app/lib/version.ts`)
- [x] T002 — Определить версию Frontend из package.json (`app/lib/version.ts`)
- [x] T003 — Определить версию Backend как константу (`app/lib/version.ts`)

## Phase 2: UI Components

- [x] T004 — Создать компонент VersionModal с Tailwind styling (`app/components/VersionModal.tsx`)
- [x] T005 — Добавить заголовок "Application Version" в VersionModal (`app/components/VersionModal.tsx`)
- [x] T006 — Добавить отображение версий (Frontend + Backend) в VersionModal (`app/components/VersionModal.tsx`)
- [x] T007 — Добавить кнопку закрытия в VersionModal (`app/components/VersionModal.tsx`)
- [x] T008 — Добавить backdrop и обработку клика вне modal (`app/components/VersionModal.tsx`)
- [x] T009 — Добавить поддержку закрытия по Escape key (`app/components/VersionModal.tsx`)

## Phase 3: Интеграция в App Page

- [x] T010 — Добавить state `showVersionModal` в app/page.tsx (`app/page.tsx`)
- [x] T011 — Добавить кнопку "Version" в header справа (`app/page.tsx`)
- [x] T012 — Добавить обработчик клика для открытия modal (`app/page.tsx`)
- [x] T013 — Добавить conditional rendering VersionModal (`app/page.tsx`)
- [x] T014 — Применить консистентные Tailwind стили для кнопки Version (`app/page.tsx`)

## Phase 4: Responsive и Accessibility

- [x] T015 — Проверить и настроить отображение modal на мобильных устройствах (`app/components/VersionModal.tsx`)
- [x] T016 — Добавить ARIA атрибуты для accessibility (`app/components/VersionModal.tsx`, `app/page.tsx`)

## Verification

- [x] T017 — Запустить линтер: `cd /private/tmp/workspace/ebb7a9f4-2a97-4350-82f8-f24d26e16911/front && npm run lint`
- [x] T018 — Проверить сборку frontend: `cd /private/tmp/workspace/ebb7a9f4-2a97-4350-82f8-f24d26e16911/front && npm run build`
- [x] T019 — Проверить TypeScript компиляцию: `cd /private/tmp/workspace/ebb7a9f4-2a97-4350-82f8-f24d26e16911/front && npx tsc --noEmit`
