package dto

import (
	"go-auth/domain/vo"
)

type UserDTO struct {
	ID        uint        `json:"id"`
	UUID      vo.UUID     `json:"uuid"`
	Name      vo.Name     `json:"name"`
	Email     vo.Email    `json:"email"`
	CreatedAt vo.DateTime `json:"created_at"`
	UpdatedAt vo.DateTime `json:"updated_at"`
}

type UserDTOResponse struct {
	Data *UserDTO `json:"data"`
}

type TokenResponse struct {
	Token string `json:"token"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}
