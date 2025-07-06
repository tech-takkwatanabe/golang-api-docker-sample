package repository

import (
	"go-auth/domain/entity"
	"go-auth/domain/vo"
)

type UserRepository interface {
	FindByID(id uint) (*entity.User, error)
	FindByUUID(uuid vo.UUID) (*entity.User, error)
	FindByEmail(email vo.Email) (*entity.User, error)
	Save(user *entity.User) error
}
