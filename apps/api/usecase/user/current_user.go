package user

import (
	"go-auth/domain/dto"
	"go-auth/service"
)

func CurrentUserUseCase(userID uint, svc service.UserService) (*dto.UserDTO, error) {
	return svc.GetUserByID(userID)
}
