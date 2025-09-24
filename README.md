# FusionBrain Image Service

Сервис для асинхронной генерации изображений через API Fusion Brain. Технологии: NestJS, Prisma (PostgreSQL), Minio, Docker. Миниатюры генерируются в формате WebP 128x128 с помощью `sharp`.

## Функционал API
- Создание изображения: `POST /images` — валидирует `prompt` и `style` (актуальные стили берутся из API Fusion Brain). Задача создаётся асинхронно.
- Получение файла: `GET /images/:id/file?type=original|thumbnail` — отдаёт оригинал или миниатюру (валидируется параметр `type`).
- Список миниатюр: `GET /images/thumbnails?page=&pageSize=` — пагинация и ссылки на файлы.

Swagger: `http://localhost:3000/api`

## Быстрый старт (Docker Compose)
1. Установите переменную окружения `FUSION_BRAIN_API_KEY` (ключ API Fusion Brain).
2. Запустите:

```bash
docker compose up -d --build
```

3. Выполните миграции Prisma (один раз при первом запуске):

```bash
docker compose exec api npx prisma migrate deploy
```

4. Откройте Swagger: `http://localhost:3000/api`.

## Переменные окружения
См. `docker-compose.yml`. Основные:
- `DATABASE_URL` — строка подключения PostgreSQL
- `MINIO_*` — параметры доступа к Minio
- `FUSION_BRAIN_API_KEY` — ключ API Fusion Brain
- `FUSION_BRAIN_API_URL` — базовый URL API

## Разработка локально
```bash
npm i
npm run prisma:generate
npm run start:dev
```

БД и Minio удобно запускать через `docker compose up postgres minio`.

## Примечания
- Оригинал сохраняется с исходным форматом, миниатюра — `webp` 128x128.
- Валидация стиля выполняется по актуальному списку стилей из Fusion Brain (кеш 1 час).

