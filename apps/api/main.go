package main

import (
	"go-auth/controllers"
	"go-auth/middlewares"
	"go-auth/models"

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

	public := router.Group("/api")

	public.POST("/register", controllers.Register)
	public.POST("/login", controllers.Login)

	protected := router.Group("/api/loggedin")
	// JWT認証ミドルウェアを適用
	protected.Use(middlewares.JwtAuthMiddleware())
	// 認証されたユーザー情報を取得するルートを定義
	protected.GET("/user", controllers.CurrentUser)
	// Swagger UIのエンドポイント
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	router.Run(":8080")
}
