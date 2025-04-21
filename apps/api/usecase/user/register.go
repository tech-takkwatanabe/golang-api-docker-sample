package user

import (
	"go-auth/domain/entity"
	"go-auth/domain/vo"
	"go-auth/models"
	"time"

	"github.com/google/uuid"
)

type RegisterInput struct {
	Name     string
	Email    string
	Password string
}

func RegisterUseCase(input RegisterInput) (*entity.User, error) {
	name, err := vo.NewName(input.Name)
	if err != nil {
		return nil, err
	}

	email, err := vo.NewEmail(input.Email)
	if err != nil {
		return nil, err
	}

	uid, err := vo.NewUUID(uuid.NewString())
	if err != nil {
		return nil, err
	}

	now := vo.NewDateTime(time.Now())

	user := &entity.User{
		UUID:      *uid,
		Name:      *name,
		Email:     *email,
		Password:  input.Password,
		CreatedAt: *now,
		UpdatedAt: *now,
	}

	_, err = models.CreateUser(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}
