init:
	[ -f .env ] || cp .env.example .env
	docker compose build
	docker compose up -d

up:
	docker compose up -d

tidy:
	docker compose exec go go mod tidy

swag:
	docker compose exec go swag init