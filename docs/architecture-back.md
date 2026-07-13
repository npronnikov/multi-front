# Архитектура репозитория back

## Заголовок
Backend API на Spring Boot

## Repo alias
back

## Назначение репозитория
Backend-приложение multi-back — это RESTful API на Spring Boot 4.1.0 для управления списком задач (Todo). Приложение предоставляет HTTP-endpoints для выполнения CRUD операций над сущностью Todo, используя JPA для работы с базой данных и Spring Data REST для репозиториев.

## Наблюдения по архитектуре

1. **Spring Boot с JPA и Spring MVC**. Приложение использует Spring Boot 4.1.0 на Java 21. Реализован классический REST Controller `TodoController` с аннотациями `@RestController`, `@RequestMapping("/api/todos")` и CRUD методами (GET, POST, PUT, DELETE). Используется внедрение зависимостей через конструктор.

2. **JPA сущность и Repository**. Сущность `Todo` использует JPA-аннотации (`@Entity`, `@Id`, `@GeneratedValue`) и Lombok для boilerplate кода (`@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`). `TodoRepository` — это Spring Data JPA репозиторий, наследуемый от `JpaRepository`, предоставляющий стандартные методы CRUD без реализации.

3. **H2 Database для персистентности**. Используется встраиваемая H2 database в файловом режиме (`jdbc:h2:file:./data/tododb`). Настроена автоматическая генерация схемы (`spring.jpa.hibernate.ddl-auto=update`). Также доступна H2 console для управления базой через web-интерфейс.

4. **Конфигурация CORS и портов**. Приложение работает на порту 8081. Настроена CORS политика для разрешения запросов с фронтенда (`http://localhost:8082`). Конфигурация вынесена в `application.properties`.

5. **Стандартная Maven структура**. Проект использует Maven для сборки с плагином `spring-boot-maven-plugin`. Структура следует Maven conventions: `src/main/java` для исходного кода, `src/main/resources` для конфигурации, `src/test` для тестов.
