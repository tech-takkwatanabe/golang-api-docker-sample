package user

import (
	"go-auth/domain/dto"
	"go-auth/domain/vo"
	"go-auth/service"

	"github.com/gin-gonic/gin"
)

func RefreshUseCase(ctx *gin.Context, refreshTokenID vo.UUID, userService service.UserService) (*dto.TokenRefreshResponse, error) {
	return userService.RefreshToken(ctx, refreshTokenID)
}
