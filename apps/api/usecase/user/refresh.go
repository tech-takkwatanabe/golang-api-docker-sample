package user

import (
	"go-auth/domain/dto"
	"go-auth/domain/vo"
	"go-auth/service"
)

func RefreshUseCase(refreshTokenID vo.UUID, userService service.UserService) (*dto.TokenRefreshResponse, error) {
	return userService.RefreshToken(refreshTokenID)
}
