package entity

import (
	"go-auth/domain/dto"
	"go-auth/domain/vo"
)

type User struct {
	ID        uint
	UUID      vo.UUID
	Name      vo.Name
	Email     vo.Email
	Password  string
	CreatedAt vo.DateTime
	UpdatedAt vo.DateTime
}

func (u *User) ToDTO() *dto.UserDTO {
	return &dto.UserDTO{
		ID:        u.ID,
		UUID:      u.UUID,
		Name:      u.Name,
		Email:     u.Email,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}
