package user

import (
	"errors"
	"go-auth/domain/entity"
	"go-auth/models"
)

func CurrentUserUseCase(userId uint) (*entity.User, error) {
	dbUser, err := models.FindUserByID(userId)
	if err != nil {
		return nil, errors.New("user not found")
	}

	return dbUser, nil
}
