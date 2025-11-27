FROM oven/bun:1.2.21 AS builder
WORKDIR /app

# 🔥 1. Ambil env dari --build-arg
ARG NEXT_PUBLIC_HOST_API
ARG NEXT_PUBLIC_HOST_WS
ARG NEXT_PUBLIC_LIVEKIT_URL

# 🔥 2. Set environment saat build
ENV NEXT_PUBLIC_HOST_API=$NEXT_PUBLIC_HOST_API
ENV NEXT_PUBLIC_HOST_WS=$NEXT_PUBLIC_HOST_WS
ENV NEXT_PUBLIC_LIVEKIT_URL=$NEXT_PUBLIC_LIVEKIT_URL

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