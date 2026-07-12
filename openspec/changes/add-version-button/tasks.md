# Tasks: Add Version Button

## Phase 1: Подготовка

- [ ] T001 — Создать файл с константами для версий приложения (`app/lib/version.ts`)
- [ ] T002 — Определить версию Frontend из package.json (`app/lib/version.ts`)
- [ ] T003 — Определить версию Backend как константу (`app/lib/version.ts`)

## Phase 2: UI Components

- [ ] T004 — Создать компонент VersionModal с Tailwind styling (`app/components/VersionModal.tsx`)
- [ ] T005 — Добавить заголовок "Application Version" в VersionModal (`app/components/VersionModal.tsx`)
- [ ] T006 — Добавить отображение версий (Frontend + Backend) в VersionModal (`app/components/VersionModal.tsx`)
- [ ] T007 — Добавить кнопку закрытия в VersionModal (`app/components/VersionModal.tsx`)
- [ ] T008 — Добавить backdrop и обработку клика вне modal (`app/components/VersionModal.tsx`)
- [ ] T009 — Добавить поддержку закрытия по Escape key (`app/components/VersionModal.tsx`)

## Phase 3: Интеграция в App Page

- [ ] T010 — Добавить state `showVersionModal` в app/page.tsx (`app/page.tsx`)
- [ ] T011 — Добавить кнопку "Version" в header справа (`app/page.tsx`)
- [ ] T012 — Добавить обработчик клика для открытия modal (`app/page.tsx`)
- [ ] T013 — Добавить conditional rendering VersionModal (`app/page.tsx`)
- [ ] T014 — Применить консистентные Tailwind стили для кнопки Version (`app/page.tsx`)

## Phase 4: Responsive и Accessibility

- [ ] T015 — Проверить и настроить отображение modal на мобильных устройствах (`app/components/VersionModal.tsx`)
- [ ] T016 — Добавить ARIA атрибуты для accessibility (`app/components/VersionModal.tsx`, `app/page.tsx`)

## Verification

- [ ] T017 — Запустить линтер: `cd /private/tmp/workspace/ebb7a9f4-2a97-4350-82f8-f24d26e16911/front && npm run lint`
- [ ] T018 — Проверить сборку frontend: `cd /private/tmp/workspace/ebb7a9f4-2a97-4350-82f8-f24d26e16911/front && npm run build`
- [ ] T019 — Проверить TypeScript компиляцию: `cd /private/tmp/workspace/ebb7a9f4-2a97-4350-82f8-f24d26e16911/front && npx tsc --noEmit`
