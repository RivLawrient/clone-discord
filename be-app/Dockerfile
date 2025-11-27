FROM golang:1.25.1 AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
# --- RUNNER ---
FROM alpine:3.19
WORKDIR /app

COPY --from=builder /app/app .


COPY --from=builder /root/go/bin/migrate /usr/local/bin/migrate

EXPOSE 8080
CMD ["/app/app"]
