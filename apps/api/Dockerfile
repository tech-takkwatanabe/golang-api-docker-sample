FROM golang:1.24.2

# 環境変数（必要なら）
ENV GO111MODULE=on

# 作業ディレクトリ
WORKDIR /app

# ホストの go.mod/go.sum をコピー（なければ初期化）
COPY go.mod ./
COPY go.sum ./
RUN go mod tidy

# ソースコードをコピー
COPY . .

# air をインストール
RUN go install github.com/air-verse/air@latest

# CMD を air に
CMD ["air", "-c", ".air.toml"]
