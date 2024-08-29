# Stage 1: Build the app
# 22.7.0-alpine3.20
FROM node@sha256:ed9736a13b88ba55cbc08c75c9edac8ae7f72840482e40324670b299336680c1 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the app
FROM nginx:alpine

# Copy built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom NGINX configuration file
COPY default.conf /etc/nginx/conf.d/default.conf

COPY env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
