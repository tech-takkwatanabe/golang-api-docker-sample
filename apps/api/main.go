package main

import (
	"go-auth/controllers"
	"go-auth/middlewares"
	"go-auth/models"

	"github.com/gin-gonic/gin"
)

func main() {
	models.ConnectDataBase()
	router := gin.Default()

	public := router.Group("/api")

	public.POST("/register", controllers.Register)
	public.POST("/login", controllers.Login)
	protected := router.Group("/api/admin")
	// JWT認証ミドルウェアを適用
	protected.Use(middlewares.JwtAuthMiddleware())
	// 認証されたユーザー情報を取得するルートを定義
	protected.GET("/user", controllers.CurrentUser)

	router.Run(":8080")
}
