init:
	[ -f .env ] || cp .env.example .env
	docker compose build
	docker compose up -d

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up -d --build

tidy:
	docker compose exec go go mod tidy

swag:
	docker compose exec go swag init

gotest:
	docker compose exec go go test ./test