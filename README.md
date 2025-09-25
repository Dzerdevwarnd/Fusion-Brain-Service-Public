# FusionBrain Image Service

Сервис для асинхронной генерации изображений через API Fusion Brain. Технологии: NestJS, Prisma (PostgreSQL), Minio, Docker. Миниатюры генерируются в формате WebP 128x128 с помощью `sharp`.

## Функционал API

- Создание изображения: `POST /images` — валидирует `prompt` и `style`. Задача создаётся асинхронно. Валидация актуальных стилей невозможна т.к. не получается получить их по URL указанной в документации
- Получение файла: `GET /images/:id/file?type=original|thumbnail` — отдаёт оригинал или миниатюру (валидируется параметр `type`).
  - Если изображение ещё не готово — 400: `Image not ready (status=...)`.
  - Если генерация завершилась ошибкой — 400 с текстом ошибки из БД.
- Список миниатюр: `GET /images/thumbnails?page=&pageSize=` — пагинация и ссылки на файлы. Возвращаются только записи со статусом `READY`.

Swagger: `http://localhost:3000/api`

## Быстрый старт (Docker Compose)

1. Скопируйте `.env.example` в `.env` и заполните значения (в т.ч. `FUSION_BRAIN_API_KEY`, `FUSION_BRAIN_API_SECRET`, `DATABASE_URL`).
2. Запустите:

```bash
docker compose up -d --build
```

3. Выполните миграции Prisma (один раз при первом запуске):

```bash
pnpm prisma:migrate
```

4. Откройте Swagger: `http://localhost:3000/api`.

## Переменные окружения

См. `docker-compose.yml`. Основные:

- `DATABASE_URL` — строка подключения PostgreSQL
- `MINIO_*` — параметры доступа к Minio
- `FUSION_BRAIN_API_KEY` — ключ API Fusion Brain
- `FUSION_BRAIN_API_SECRET` — секрет API Fusion Brain
- `FUSION_BRAIN_API_URL` — базовый URL API

## Разработка локально

```bash
pnpm i
pnpm run prisma:generate
pnpm run start:dev
```

БД и Minio удобно запускать через `docker compose up`.

## Примечания

- Оригинал сохраняется с исходным форматом, миниатюра — `webp` 128x128.
- Эндпоинт списка миниатюр возвращает только готовые изображения (`READY`).
- `GET /images/:id/file` вернёт 400, если статус `FAILED` (с сообщением об ошибке) или не `READY` (с текущим статусом).
