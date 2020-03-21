# Production client image
FROM node:alpine as builder
WORKDIR /app
COPY ./package*.json ./
RUN apk add --no-cache git
RUN npm install
COPY . .
RUN npm run build

# Use nginx as static server
FROM nginx
EXPOSE 8080
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html