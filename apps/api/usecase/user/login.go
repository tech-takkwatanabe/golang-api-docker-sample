package user

import (
	"go-auth/domain/dto"
	"go-auth/service"
)

type LoginInput struct {
	Email    string
	Password string
}

func LoginUseCase(input LoginInput, svc service.UserService) (*dto.TokenDTO, error) {
	token, err := svc.LoginUser(input.Email, input.Password)
	if err != nil {
		return nil, err
	}

	return &dto.TokenDTO{Token: token}, nil
}
