# BUILD

FROM node:22.13.1-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src

# RUN

FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

ENV NODE_ENV=production \
    TZ=UTC \
    NODE_OPTIONS="--disable-proto=throw --no-warnings --use-openssl-ca --experimental-strip-types"

CMD ["src/index.ts"]