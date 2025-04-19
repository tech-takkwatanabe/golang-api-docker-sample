init:
	[ -f .env ] || cp .env.example .env
	docker compose build
	docker compose up -d

go_mod_tidy:
	docker compose exec go go mod tidy