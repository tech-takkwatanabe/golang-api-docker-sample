package main

import (
	"go-auth/controllers"
	"go-auth/domain/repository"
	"go-auth/middlewares"
	"go-auth/models"
	"go-auth/service"
	"os"

	_ "go-auth/docs"
	dynamodbRepo "go-auth/infrastructure/dynamodb"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           Go Auth API
// @version         1.0
// @description     Gin + JWT 認証API

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description JWTトークンをAuthorizationヘッダーに含めてください
// @host      localhost:8080
func main() {
	models.ConnectDataBase()
	router := gin.Default()

	frontendURL := os.Getenv("FRONTEND_URL")
	router.Use(middlewares.CorsMiddleware([]string{frontendURL}))
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	userRepo := repository.NewUserRepository()
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
	protected.Use(middlewares.JwtAuthMiddleware())

	// 認証されたユーザー情報を取得する
	protected.GET("/user", controllers.CurrentUser(userService))
	// ログアウト
	protected.POST("/logout", controllers.Logout())

	router.Run(":8080")
}
