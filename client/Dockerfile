FROM node:20-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходники React
COPY . .

# Открываем порт 3001 (как указано в .env фронтенда)
EXPOSE 3001

# Запускаем dev‑сервер React
CMD ["npm", "start"]