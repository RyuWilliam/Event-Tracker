# Etapa 1: Construir la aplicación
FROM node:20-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias e instalar
COPY package.json package-lock.json* ./
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Construir la aplicación para producción (Vite crea la carpeta dist)
RUN npm run build

# Etapa 2: Servir la aplicación estática con Nginx
FROM nginx:alpine

# Copiar configuración customizada del proxy en Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados de la etapa anterior al servidor Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80 para poder acceder a la app
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]