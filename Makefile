.PHONY: help dev build lint fmt test install clean \
        web/dev web/build web/lint web/fmt web/test \
        api/dev api/build api/lint api/fmt api/test

help: ## コマンド一覧を表示
	@grep -hE '^[a-zA-Z_/-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ===== 全体 =====
dev: ## フロント + API を同時起動
	$(MAKE) -j2 web/dev api/dev

build: web/build api/build ## 両方ビルド

lint: web/lint api/lint ## 両方lint

fmt: web/fmt api/fmt ## 両方フォーマット

test: web/test api/test ## 両方テスト

install: ## 初回セットアップ
	cd apps/web && pnpm install
	cd apps/api && [ -f .env ] || cp .env.example .env
	cd apps/api && docker compose build

clean: ## ビルド成果物を削除
	cd apps/web && rm -rf dist build coverage
	cd apps/api && docker compose down

# ===== web (React) =====
web/dev: ## フロントのみ起動
	cd apps/web && pnpm dev

web/build: ## フロントのみビルド
	cd apps/web && pnpm build

web/lint: ## フロントのみlint
	cd apps/web && pnpm lint

web/fmt: ## フロントのみフォーマット
	cd apps/web && pnpm fmt

web/test: ## フロントのみテスト
	cd apps/web && pnpm test

# ===== api (Go) =====
api/dev: ## APIのみ起動
	cd apps/api && docker compose up

api/build: ## APIのみビルド
	cd apps/api && docker compose build

api/lint: ## APIのみlint (go vet)
	cd apps/api && docker compose exec -T go go vet ./...

api/fmt: ## APIのみフォーマット (gofmt)
	cd apps/api && docker compose exec -T go gofmt -w .

api/test: ## APIのみテスト
	cd apps/api && docker compose exec -T go go test ./...
