package service

import (
	"context"
	"fmt"
	"go-auth/config"
	"go-auth/domain/dto"
	"go-auth/domain/entity"
	"go-auth/domain/repository"
	"go-auth/domain/vo"
	"go-auth/utils/hash"
	"go-auth/utils/token"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type UserService interface {
	GetUserByID(id uint) (*dto.UserDTO, error)
	GetUserBySub(uuid vo.UUID) (*dto.UserDTO, error)
	RegisterUser(user *entity.User) error
	LoginUser(email vo.Email, password string) (string, string, vo.UUID, error)
	RefreshToken(c *gin.Context, refreshTokenID vo.UUID) (*dto.TokenRefreshResponse, error)
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

	accessTokenStr, _, err := token.GenerateToken(user.UUID, config.AccessTokenExpireSeconds)
	if err != nil {
		return "", "", vo.UUID{}, err
	}

	refreshTokenStr, refreshTokenJti, err := token.GenerateToken(user.UUID, config.RefreshTokenExpireSeconds)
	if err != nil {
		return "", "", vo.UUID{}, err
	}

	// リフレッシュトークンのidをjtiに設定
	refreshTokenID, err := vo.NewUUID(refreshTokenJti)
	if err != nil {
		return "", "", vo.UUID{}, fmt.Errorf("invalid user UUID: %w", err)
	}

	expiresAt := time.Now().Add(time.Duration(config.RefreshTokenExpireSeconds) * time.Second).Unix()

	refreshToken := &entity.RefreshToken{
		RefreshTokenID: refreshTokenID,
		UserID:         user.ID,
		Token:          refreshTokenStr,
		ExpiresAt:      expiresAt,
		CreatedAt:      time.Now(),
	}
	// 新しいリフレッシュトークンをDynamoDBに保存
	if err := s.refreshTokenRepo.Put(context.Background(), refreshToken); err != nil {
		return "", "", vo.UUID{}, fmt.Errorf("failed to save refresh token: %w", err)
	}

	return accessTokenStr, refreshTokenStr, user.UUID, nil
}

/**
 * リフレッシュトークンを使用して新しいアクセストークンを取得する（リフレッシュトークンもローテーションする）
 * @param c gin.Context
 * @param refreshTokenID リフレッシュトークンID
 * @return *dto.TokenRefreshResponse 新しいアクセストークン
 */
func (s *userService) RefreshToken(c *gin.Context, refreshTokenID vo.UUID) (*dto.TokenRefreshResponse, error) {
	oldRefreshToken, err := s.refreshTokenRepo.Get(context.Background(), &refreshTokenID)
	if err != nil {
		return nil, fmt.Errorf("failed to get refresh token: %w", err)
	}

	if time.Now().After(time.Unix(oldRefreshToken.ExpiresAt, 0)) {
		_ = s.refreshTokenRepo.Delete(context.Background(), &refreshTokenID)
		return nil, fmt.Errorf("refresh token expired")
	}

	// oldRefreshTokenのClaimsからsubを取得
	tokenObj, err := token.ParseToken(oldRefreshToken.Token)
	if err != nil {
		return nil, fmt.Errorf("failed to parse refresh token: %w", err)
	}
	claims, ok := tokenObj.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid refresh token claims")
	}
	subStr, ok := claims["sub"].(string)
	if !ok {
		return nil, fmt.Errorf("sub claim not found in refresh token")
	}
	// リフレッシュトークンの再生成
	subUUID, err := vo.NewUUID(subStr)
	if err != nil {
		return nil, fmt.Errorf("invalid sub claim UUID: %w", err)
	}
	newRefreshTokenStr, newRefreshTokenJti, err := token.GenerateToken(*subUUID, config.RefreshTokenExpireSeconds)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	newRefreshTokenID, err := vo.NewUUID(newRefreshTokenJti)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token UUID: %w", err)
	}
	newRefreshToken := &entity.RefreshToken{
		RefreshTokenID: newRefreshTokenID,
		UserID:         oldRefreshToken.UserID,
		Token:          newRefreshTokenStr,
		ExpiresAt:      time.Now().Add(time.Duration(config.RefreshTokenExpireSeconds) * time.Second).Unix(),
		CreatedAt:      time.Now(),
	}
	// トークンをアトミックにローテーション
	rotateErr := s.refreshTokenRepo.Rotate(context.Background(), &refreshTokenID, newRefreshToken)
	if rotateErr != nil {
		// トランザクションが失敗した場合 (例: 条件チェック失敗によるリプレイ攻撃検知)
		return nil, fmt.Errorf("failed to rotate refresh token: %w", rotateErr)
	}

	// 新しいアクセストークンを生成
	newAccessTokenStr, _, err := token.GenerateToken(*subUUID, config.AccessTokenExpireSeconds)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	return &dto.TokenRefreshResponse{
		AccessToken:  newAccessTokenStr,
		RefreshToken: newRefreshTokenStr,
	}, nil
}
