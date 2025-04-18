package middlewares

import (
	"go-auth/utils/token"
	"net/http"

	"github.com/gin-gonic/gin"
)

// JwtAuthMiddleware はJWT認証を行うミドルウェアを返します
func JwtAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		err := token.TokenValid(c)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		c.Next()
	}
}
