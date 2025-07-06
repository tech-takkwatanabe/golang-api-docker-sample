package main

import (
	"flag"
	"go-auth/config"
	"go-auth/controllers"
	"go-auth/external"
	"go-auth/middlewares"
	"go-auth/models"
	"go-auth/service"
	"log"
	"os"

	_ "go-auth/docs"
	dynamodbRepo "go-auth/infrastructure/dynamodb"
	infra_repo "go-auth/infrastructure/repository"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           Go Auth API
// @version         1.0
// @description     Gin + JWT 認証API

// @securityDefinitions.apikey CookieAuth
// @in header
// @name Cookie
// @description HttpOnly Cookie (access_token) によって自動で認証されます
func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
	config.LoadConfig()
	db := external.ConnectDB()

	var migrate bool
	flag.BoolVar(&migrate, "migrate", false, "Run database migrations and exit")
	flag.Parse()
	if migrate {
		models.DBMigrate(db)
		os.Exit(0) // マイグレーションが完了したらサーバーは起動せずに終了
	}

	router := gin.Default()

	frontendURL := config.FrontendURL
	router.Use(middlewares.CorsMiddleware([]string{frontendURL}))
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	userRepo := infra_repo.NewUserRepository(db)
	refreshTokenRepo := dynamodbRepo.NewRefreshTokenRepository()
	userService := service.NewUserService(userRepo, refreshTokenRepo)

	public := router.Group("/api")

	// Swagger UIのエンドポイント
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// 新規ユーザー登録
	public.POST("/register", controllers.Register(userService))
	// ログイン
	public.POST("/login", controllers.Login(userService))

	// 認証後のルート
	protected := router.Group("/api/loggedin")
	// JWT認証ミドルウェアを適用
	protected.Use(middlewares.JwtAuthMiddleware(config.AccessTokenCookieName))

	// 認証されたユーザー情報を取得する
	protected.GET("/user", controllers.CurrentUser(userService))
	// ログアウト
	protected.POST("/logout", controllers.Logout(userService))
	// トークンリフレッシュ
	router.POST("/api/loggedin/refresh", middlewares.JwtAuthMiddleware(config.RefreshTokenCookieName), controllers.Refresh(userService))

	router.Run(":8080")
}
