package user

import (
	"go-auth/domain/dto"
	"go-auth/domain/entity"
	"go-auth/domain/vo"
	"go-auth/service"
	"time"
)

type RegisterInput struct {
	Name     vo.Name
	Email    vo.Email
	Password string
}

func RegisterUseCase(input RegisterInput, svc service.UserService) (*dto.UserDTO, error) {
	name, err := vo.NewName(input.Name.String())
	if err != nil {
		return nil, err
	}

	email, err := vo.NewEmail(input.Email.String())
	if err != nil {
		return nil, err
	}

	// uuid生成
	uuid := vo.NewUUIDv7()

	now := vo.NewDateTime(time.Now())

	user := &entity.User{
		UUID:      *uuid,
		Name:      *name,
		Email:     *email,
		Password:  input.Password,
		CreatedAt: *now,
		UpdatedAt: *now,
	}

	err = svc.RegisterUser(user)
	if err != nil {
		return nil, err
	}

	return user.ToDTO(), nil
}
