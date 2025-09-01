FROM golang:1.24.4-alpine3.22

ENV GO111MODULE=on
ENV PATH="/go/bin:${PATH}"
ENV GOCACHE=/tmp/.cache/go-build

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod tidy

COPY . .

# ビルドキャッシュ節約のために先に swag 入れる
RUN go install github.com/swaggo/swag/cmd/swag@latest \
  && cp /go/bin/swag /usr/local/bin/ \
  && go clean -cache

RUN go install github.com/air-verse/air@latest \
  && go clean -cache

CMD ["air", "-c", ".air.toml"]
