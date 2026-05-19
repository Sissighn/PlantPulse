# Build-Phase
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den restlichen Quellcode
COPY . .

# Baue die Vite App für Produktion
RUN npm run build

# Produktions-Phase mit Nginx
FROM nginx:alpine

# Kopiere die gebauten Dateien aus dem Builder-Container in den Nginx html-Ordner
COPY --from=builder /app/dist /usr/share/nginx/html

# Eigene Nginx-Konfiguration für Single-Page-Applications
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponiere Port 80
EXPOSE 80

# Starte Nginx
CMD ["nginx", "-g", "daemon off;"]
