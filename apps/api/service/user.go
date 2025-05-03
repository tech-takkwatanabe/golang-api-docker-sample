package service

import (
	"fmt"
	"go-auth/domain/dto"
	"go-auth/domain/entity"
	"go-auth/domain/repository"
	"go-auth/domain/vo"
	"go-auth/utils/hash"
	"go-auth/utils/token"
	"os"
	"strconv"
)

var (
	accessTokenExpireSeconds  int
	refreshTokenExpireSeconds int
)

func init() {
	var err error
	accessTokenExpireSeconds, err = strconv.Atoi(os.Getenv("ACCESS_TOKEN_EXPIRE_SECONDS"))
	if err != nil {
		accessTokenExpireSeconds = 900
	}
	refreshTokenExpireSeconds, err = strconv.Atoi(os.Getenv("REFRESH_TOKEN_EXPIRE_SECONDS"))
	if err != nil {
		refreshTokenExpireSeconds = 3600
	}
}

type UserService interface {
	GetUserByID(id uint) (*dto.UserDTO, error)
	GetUserBySub(uuid vo.UUID) (*dto.UserDTO, error)
	RegisterUser(user *entity.User) error
	LoginUser(email vo.Email, password string) (string, vo.UUID, error)
}

type userService struct {
	repo             repository.UserRepository
	refreshTokenRepo repository.RefreshTokenRepository
}

func NewUserService(repo repository.UserRepository, refreshTokenRepo repository.RefreshTokenRepository) UserService {
	return &userService{
		repo:             repo,
		refreshTokenRepo: refreshTokenRepo,
	}
}

func (s *userService) GetUserByID(id uint) (*dto.UserDTO, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return user.ToDTO(), nil
}

func (s *userService) GetUserBySub(uuid vo.UUID) (*dto.UserDTO, error) {
	user, err := s.repo.FindByUUID(uuid)
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

func (s *userService) LoginUser(email vo.Email, password string) (string, vo.UUID, error) {
	emailVO, err := vo.NewEmail(email.String())
	if err != nil {
		return "", vo.UUID{}, fmt.Errorf("invalid email format")
	}
	user, err := s.repo.FindByEmail(*emailVO)
	if err != nil {
		return "", vo.UUID{}, fmt.Errorf("invalid email")
	}

	if !hash.CheckPasswordHash(password, user.Password) {
		return "", vo.UUID{}, fmt.Errorf("invalid password")
	}

	accessTokenStr, err := token.GenerateToken(user.UUID, accessTokenExpireSeconds)
	if err != nil {
		return "", vo.UUID{}, err
	}

	return accessTokenStr, user.UUID, nil
}
