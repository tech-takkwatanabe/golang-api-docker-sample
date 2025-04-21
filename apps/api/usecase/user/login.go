package user

import (
	"errors"
	"go-auth/models"
)

type LoginInput struct {
	Email    string
	Password string
}

type LoginOutput struct {
	Token string
}

func LoginUseCase(input LoginInput) (*LoginOutput, error) {
	// Authenticate the user (この部分は必要に応じて repository を使ってリファクタリング)
	jwtToken, err := models.AuthenticateUser(input.Email, input.Password)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	return &LoginOutput{
		Token: jwtToken,
	}, nil
}
