FROM oven/bun:1.2.21 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .
RUN bun run build

# --- RUNNER ---
FROM oven/bun:1.2.21
WORKDIR /app

COPY --from=builder /app/ ./

EXPOSE 3000
CMD ["bun", "run", "start"]