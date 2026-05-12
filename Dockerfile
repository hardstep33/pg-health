FROM node:20-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь исходный код бэкенда
COPY . .

# Открываем порт 3000 (как в main.ts)
EXPOSE 3000

# Запускаем в dev‑режиме (следит за изменениями)
CMD ["npm", "run", "start:dev"]