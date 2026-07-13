# Architecture Overview

**Repo alias:** main

**Назначение:** Монорепозиторий для fullstack todo-приложения с Spring Boot backend и Next.js frontend.

## Наблюдения по архитектуре:

1. **Монорепозиторная структура:** Проект организован как два отдельных репозитория в едином workspace — `back/` (Spring Boot) и `front/` (Next.js), каждый с собственной системой сборки и зависимостями.

2. **Clear separation of concerns:** Backend (порт 8081) предоставляет REST API для CRUD операций с Todo сущностями, frontend (порт 8082) отвечает за UI и взаимодействие с пользователем через HTTP клиент.

3. **Technology stack:**
   - Backend: Spring Boot 4.1.0 + Spring Data JPA + H2 database, Java 21
   - Frontend: Next.js 16.2.10 + React 19 + Tailwind CSS 4, TypeScript

4. **Простая доменная модель:** Единственная сущность `Todo` с полями id, text, completed — классическое todo-приложение для демонстрации базовых CRUD операций и REST API паттернов.

5. **Development workflow:** Оба репозитория используют стандартные команды запуска — `mvn spring-boot:run` для backend, `npm run dev` для frontend, с независимыми процессами сборки и тестирования.
