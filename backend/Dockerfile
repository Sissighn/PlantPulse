FROM node:20-alpine

WORKDIR /app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den restlichen Quellcode
COPY . .

# Exponiere den Port, auf dem das Backend läuft
EXPOSE 3000

# Starte den Server
CMD ["npm", "start"]
