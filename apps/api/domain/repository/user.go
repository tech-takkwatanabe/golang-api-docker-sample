package repository

import (
	"go-auth/domain/entity"
	"go-auth/domain/vo"
	"go-auth/models"
)

type UserRepository interface {
	FindByID(id uint) (*entity.User, error)
	FindByUUID(uuid vo.UUID) (*entity.User, error)
	FindByEmail(email vo.Email) (*entity.User, error)
	Save(user *entity.User) error
}

type userRepository struct{}

func NewUserRepository() UserRepository {
	return &userRepository{}
}

func (r *userRepository) FindByID(id uint) (*entity.User, error) {
	var model models.User
	if err := models.DB.First(&model, id).Error; err != nil {
		return nil, err
	}
	return models.ToEntity(&model)
}

func (r *userRepository) FindByUUID(uuid vo.UUID) (*entity.User, error) {
	var model models.User
	if err := models.DB.First(&model, uuid).Error; err != nil {
		return nil, err
	}
	return models.ToEntity(&model)
}

func (r *userRepository) FindByEmail(email vo.Email) (*entity.User, error) {
	var model models.User
	if err := models.DB.Where("email = ?", email.String()).First(&model).Error; err != nil {
		return nil, err
	}
	return models.ToEntity(&model)
}

func (r *userRepository) Save(user *entity.User) error {
	modelUser := models.ToModel(user)

	if err := models.DB.Create(modelUser).Error; err != nil {
		return err
	}

	user.ID = modelUser.ID
	return nil
}
