package service

import (
	"fmt"
	"go-auth/domain/dto"
	"go-auth/domain/entity"
	"go-auth/domain/repository"
	"go-auth/domain/vo"
	"go-auth/utils/hash"
	"go-auth/utils/token"
)

type UserService interface {
	GetUserByID(id uint) (*dto.UserDTO, error)
	RegisterUser(user *entity.User) error
	LoginUser(email string, password string) (string, error)
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
	existingUser, err := s.repo.FindByEmail(user.Email)
	if err == nil && existingUser != nil {
		return fmt.Errorf("email already in use")
	}

	hashedPassword, err := hash.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword

	err = s.repo.Save(user)
	if err != nil {
		return err
	}

	return nil
}

func (s *userService) LoginUser(email string, password string) (string, error) {
	emailVO, err := vo.NewEmail(email)
	if err != nil {
		return "", fmt.Errorf("invalid email format")
	}
	user, err := s.repo.FindByEmail(*emailVO)
	if err != nil {
		return "", fmt.Errorf("invalid email")
	}

	if !hash.CheckPasswordHash(password, user.Password) {
		return "", fmt.Errorf("invalid password")
	}

	tokenStr, err := token.GenerateToken(user.ID)
	if err != nil {
		return "", err
	}

	return tokenStr, nil
}
