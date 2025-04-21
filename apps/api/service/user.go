package service

import (
	"go-auth/domain/dto"
	"go-auth/domain/entity"
	"go-auth/domain/repository"
)

type UserService interface {
	GetUserByID(id uint) (*dto.UserDTO, error)
	RegisterUser(user *entity.User) error
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) GetUserByID(id uint) (*dto.UserDTO, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return user.ToDTO(), nil
}

func (s *userService) RegisterUser(user *entity.User) error {
	// ここでビジネスロジック（例えば、メールアドレスの重複チェック）を追加
	return s.repo.Save(user)
}
