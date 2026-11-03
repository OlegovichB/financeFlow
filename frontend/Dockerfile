
# Stage 1: Build React application
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build production frontend
RUN npm run build


# Stage 2: Serve application with Caddy
FROM caddy:2-alpine

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Copy compiled React application
COPY --from=build /app/dist /srv

EXPOSE 80
EXPOSE 443
