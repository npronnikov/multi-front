# Architecture Overview: back (multi-back)

**Repo alias:** FRONT

**Назначение:**
Бэкенд-репозиторий Spring Boot-приложения с REST API для управления Todo-задачами. Предоставляет JPA-репозитории с H2-базой данных и REST-контроллеры.

## Архитектурные наблюдения

1. **Spring Boot 4.1.0 + Java 21** — современный стек с Jakarta Persistence (не javax), Maven-сборка через mvnw, Spring Data REST для автоматического暴露ения репозиториев.

2. **Классическая трехслойная архитектура** — сущность Todo (JPA Entity), TodoRepository (JPA Repository), TodoController (REST) с dependency injection через конструктор.

3. **H2 in-memory database** — база данных в памяти для разработки, с H2 Console для управления данными через web-интерфейс.

4. **RESTful API с CRUD операциями** — endpoints GET/POST/PUT/DELETE на `/api/todos`, с корректными HTTP-статусами (201, 204, 404) и ResponseStatusException для обработки ошибок.

5. **Lombok для boilerplate-кода** — аннотации @Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor уменьшают количество кода, конфигурация maven-compiler-plugin для annotation processing.
