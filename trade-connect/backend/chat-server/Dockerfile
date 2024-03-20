# Stage 1 - Build the base
FROM node:18-alpine AS base
WORKDIR /app
COPY src ./src
COPY package*.json ./
COPY tsconfig*.json ./
COPY tsup.config.ts ./
RUN yarn install

# Stage 2 - Build the app
FROM base AS build
WORKDIR /app
RUN yarn run build

# Stage 3 - Production
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --only-production
COPY --from=build /app/build ./

CMD ["node", "index.js"]