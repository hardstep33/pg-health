# pg-health (deepseek_version)

Мониторинг PostgreSQL с улучшенной архитектурой.

## Основные изменения
- Бэкенд на чистом `pg` без TypeORM
- Кэширование медленных данных
- API Key аутентификация
- Healthcheck
- Системные метрики через Node.js (не через SQL)
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