FROM golang:1.24.2

ENV GO111MODULE=on
ENV PATH="/go/bin:${PATH}"

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod tidy

COPY . .

RUN go install github.com/air-verse/air@latest

CMD ["air", "-c", ".air.toml"]
