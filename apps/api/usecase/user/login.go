package user

import (
	"fmt"
	"go-auth/domain/dto"
	"go-auth/domain/vo"
	"go-auth/service"
)

type LoginInput struct {
	Email    vo.Email
	Password string
}

func LoginUseCase(input LoginInput, svc service.UserService) (*dto.LoginResponse, error) {
	accessToken, refreshToken, uuid, err := svc.LoginUser(input.Email, input.Password)
	if err != nil {
		return nil, fmt.Errorf("login failed: %w", err)
	}

	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: dto.UserSubDTO{
			Sub: uuid,
		},
	}, nil
}
