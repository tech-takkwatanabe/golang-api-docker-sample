package repository

import (
	"go-auth/domain/entity"
	"go-auth/models"
)

type UserRepository interface {
	FindByID(id uint) (*entity.User, error)
	Save(user *entity.User) error
}

type userRepository struct{}

func NewUserRepository() UserRepository {
	return &userRepository{}
}

func (r *userRepository) FindByID(id uint) (*entity.User, error) {
	var user entity.User
	if err := models.DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Save(user *entity.User) error {
	if err := models.DB.Save(user).Error; err != nil {
		return err
	}
	return nil
}
