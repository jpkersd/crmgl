# Estágio 1: Build
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio 2: Produção (Servidor Web Nginx)
FROM nginx:alpine
# Copia o build do Vite para a pasta pública do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Copia o arquivo de configuração customizado do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
