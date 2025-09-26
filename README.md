# FusionBrain Image Service

Сервис для асинхронного создания изображений с использованием API Fusion Brain.

Технологии: Docker, NestJS, Prisma ORM (PostgreSQL), Minio, Swagger. Миниатюры генерируются через `sharp` в формате WebP 128×128.

Swagger: `http://localhost:3001/api`
MinIO Console: `http://localhost:9001` (логин: minioadmin, пароль: minioadmin)

## Требования (реализовано)

- Создание изображения: `POST /images` — принимает `prompt` и `style` (style не валидируется т.к. в документации указана нерабочая ссылка на получение актульных стилей)задача создаётся асинхронно, возвращается `{ id, status: 'PENDING' }`.
- Получение файла: `GET /images/:id/file?type=original|thumbnail` — возвращает оригинал или миниатюру (валидируется `type`). 400 — если не готово/ошибка; 404 — если нет записи/файла.
- Список миниатюр: `GET /images/thumbnails?page=&pageSize=` — пагинация и ссылки на файлы изображений.
- Документация Swagger с актуальными схемами ответов.

Примечание по стилям: значение `style` валидируется на уровне DTO; список актуальных стилей берётся из интеграции с Fusion Brain (или конфигурации) и может быть расширен без изменения API.

## Запуск в Docker

1. Создайте файл `.env` из шаблона `.env.example` и заполните значения (см. раздел «Переменные окружения»).

2. Запустите все сервисы:

```bash
docker compose up -d --build
```

3. Примените миграции Prisma (однократно при первом запуске):

```bash
docker compose exec api pnpm prisma:migrate
```

4. Откройте Swagger: `http://localhost:3001/api`.

## Переменные окружения

Указываются в `.env` или секции `environment` `docker-compose.yml`:

- `PORT` — порт API (по умолчанию 3000)
- `API_BASE_URL` — базовый URL для формирования ссылок на файлы
- `DATABASE_URL` — строка подключения PostgreSQL
- `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_USE_SSL`
- `FUSION_BRAIN_API_URL`, `FUSION_BRAIN_API_KEY`, `FUSION_BRAIN_API_SECRET`

## Локальная разработка

```bash
pnpm i
pnpm prisma:generate
pnpm start:dev
```

PostgreSQL и Minio можно поднять через `docker compose up`.

## Детали реализации

- Оригинал сохраняется в исходном формате, миниатюра — `webp` 128×128.
- Файлы хранятся в Minio; ссылки формируются через API сервиса для безопасности.
- Обработка ошибок:
  - `GET /images/:id/file` — 400 при статусе `FAILED`/не `READY`, 404 при отсутствии файла/записи.
