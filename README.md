# pg-health (deepseek_version)

Мониторинг PostgreSQL

## Основные изменения
- Бэкенд на чистом `pg` без TypeORM
- API Key аутентификация
- Healthcheck
- Исправленный QPS без `pg_sleep`
- Пагинация на фронтенде

## Запуск
```bash
cp .env.example .env
# заполните .env
docker-compose up -d
```

Фронтенд: `cd client && npm start`
Бэкенд: `npm run start:dev`

## Ветка

Основана на `redesign`, добавлены улучшения.