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

migrate:
	docker compose exec go go run main.go -migrate

gotest:
	docker compose exec go go test ./test

update-deps:
	go list -m -u all
	go get -u ./...
	go mod tidy
