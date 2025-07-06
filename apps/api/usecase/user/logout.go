package user

import (
	"log"

	"go-auth/config"
	"go-auth/service"
	"go-auth/utils/token"

	"github.com/gin-gonic/gin"
)

func LogoutUseCase(c *gin.Context, userService service.UserService) {
	refreshTokenID, err := token.ExtractTokenJti(c, config.RefreshTokenCookieName)
	if err == nil {
		if delErr := userService.DeleteRefreshToken(c.Request.Context(), refreshTokenID); delErr != nil {
			log.Printf("failed to delete refresh token from DB on logout: %v", delErr)
		}
	}
}
