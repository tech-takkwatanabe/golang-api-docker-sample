package service

import (
	"context"
	"fmt"
	"go-auth/domain/dto"
	"go-auth/domain/entity"
	"go-auth/domain/repository"
	"go-auth/domain/vo"
	"go-auth/utils/hash"
	"go-auth/utils/token"
	"os"
	"strconv"
	"time"
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
	LoginUser(email vo.Email, password string) (string, string, vo.UUID, error)
	RefreshToken(refreshTokenID vo.UUID) (*dto.TokenRefreshResponse, error)
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

/**
 * ユーザーIDからユーザー情報を取得する
 * @param id ユーザーID
 * @return *dto.UserDTO ユーザー情報
 */
func (s *userService) GetUserByID(id uint) (*dto.UserDTO, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return user.ToDTO(), nil
}

/**
 * ユーザーUUIDからユーザー情報を取得する
 * @param uuid UUID
 * @return *dto.UserDTO ユーザー情報
 */
func (s *userService) GetUserBySub(uuid vo.UUID) (*dto.UserDTO, error) {
	user, err := s.repo.FindByUUID(uuid)
	if err != nil {
		return nil, err
	}
	return user.ToDTO(), nil
}

/**
 * ユーザー登録
 * @param user ユーザー情報
 * @return error エラー
 */
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

/**
 * ユーザーログイン
 * @param email メールアドレス
 * @param password パスワード
 * @return string アクセストークン
 * @return string リフレッシュトークン
 * @return vo.UUID ユーザーUUID
 */
func (s *userService) LoginUser(email vo.Email, password string) (string, string, vo.UUID, error) {
	emailVO, err := vo.NewEmail(email.String())
	if err != nil {
		return "", "", vo.UUID{}, fmt.Errorf("invalid email format")
	}
	user, err := s.repo.FindByEmail(*emailVO)
	if err != nil {
		return "", "", vo.UUID{}, fmt.Errorf("invalid email")
	}

	if !hash.CheckPasswordHash(password, user.Password) {
		return "", "", vo.UUID{}, fmt.Errorf("invalid password")
	}

	accessTokenStr, err := token.GenerateToken(user.UUID, accessTokenExpireSeconds)
	if err != nil {
		return "", "", vo.UUID{}, err
	}

	refreshTokenStr, err := token.GenerateToken(user.UUID, refreshTokenExpireSeconds)
	if err != nil {
		return "", "", vo.UUID{}, err
	}

	// リフレッシュトークンのidをユーザーのUUIDに設定
	refreshTokenID, err := vo.NewUUID(user.UUID.String())
	if err != nil {
		return "", "", vo.UUID{}, fmt.Errorf("invalid user UUID: %w", err)
	}

	expiresAt := time.Now().Add(time.Duration(refreshTokenExpireSeconds) * time.Second).Unix()

	refreshToken := &entity.RefreshToken{
		RefreshTokenID: refreshTokenID,
		UserID:         user.ID,
		Token:          refreshTokenStr,
		ExpiresAt:      time.Unix(expiresAt, 0),
		CreatedAt:      time.Now(),
	}
	// 新しいリフレッシュトークンをDynamoDBに保存
	if err := s.refreshTokenRepo.Put(context.Background(), refreshToken); err != nil {
		return "", "", vo.UUID{}, fmt.Errorf("failed to save refresh token: %w", err)
	}

	return accessTokenStr, refreshTokenStr, user.UUID, nil
}

/**
 * リフレッシュトークンを使用して新しいアクセストークンを取得する
 * @param refreshTokenID リフレッシュトークンID
 * @return *dto.TokenRefreshResponse 新しいアクセストークン
 */
func (s *userService) RefreshToken(refreshTokenID vo.UUID) (*dto.TokenRefreshResponse, error) {
	refreshToken, err := s.refreshTokenRepo.Get(context.Background(), &refreshTokenID)
	if err != nil {
		return nil, fmt.Errorf("failed to get refresh token: %w", err)
	}

	if time.Now().After(refreshToken.ExpiresAt) {
		return nil, fmt.Errorf("refresh token expired")
	}

	newAccessTokenStr, err := token.GenerateToken(*refreshToken.RefreshTokenID, accessTokenExpireSeconds)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	return &dto.TokenRefreshResponse{
		AccessToken: newAccessTokenStr,
	}, nil
}
