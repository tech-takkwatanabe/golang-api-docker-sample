package user

import (
	"go-auth/domain/dto"
	"go-auth/domain/vo"
	"go-auth/service"
)

func CurrentUserUseCase(uuid vo.UUID, svc service.UserService) (*dto.UserDTO, error) {
	return svc.GetUserBySub(uuid)
}
