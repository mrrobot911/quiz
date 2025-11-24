FROM golang:1.25-alpine AS builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o server ./cmd

FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates libc6-compat

WORKDIR /root/

COPY --from=builder /app/server .
COPY --from=builder /app/pkg/db/questions.json ./pkg/db/
COPY --from=builder /app/docs ./docs/

EXPOSE 5000

CMD ["./server"]
