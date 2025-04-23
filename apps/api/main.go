package main

import (
	"go-auth/controllers"
	"go-auth/domain/repository"
	"go-auth/middlewares"
	"go-auth/models"
	"go-auth/service"
	"os"

	_ "go-auth/docs"

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
	userService := service.NewUserService(userRepo)

	public := router.Group("/api")

	public.POST("/register", controllers.Register(userService))
	public.POST("/login", controllers.Login(userService))

	protected := router.Group("/api/loggedin")
	// JWT認証ミドルウェアを適用
	protected.Use(middlewares.JwtAuthMiddleware())
	// 認証されたユーザー情報を取得するルートを定義
	protected.GET("/user", controllers.CurrentUser(userService))
	// Swagger UIのエンドポイント
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	router.Run(":8080")
}
