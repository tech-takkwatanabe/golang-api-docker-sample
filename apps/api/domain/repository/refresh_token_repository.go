package repository

import (
	"context"
	"go-auth/domain/entity"
	"go-auth/domain/vo"
)

type RefreshTokenRepository interface {
	Put(ctx context.Context, token *entity.RefreshToken) error
	Get(ctx context.Context, refreshTokenID *vo.UUID) (*entity.RefreshToken, error)
	Delete(ctx context.Context, refreshTokenID *vo.UUID) error
}

// Concrete implementation of the RefreshTokenRepository interface
type refreshTokenRepositoryImpl struct{}

func (r *refreshTokenRepositoryImpl) Put(ctx context.Context, token *entity.RefreshToken) error {
	// Implement the method
	return nil
}

func (r *refreshTokenRepositoryImpl) Get(ctx context.Context, refreshTokenID *vo.UUID) (*entity.RefreshToken, error) {
	// Implement the method
	return nil, nil
}

func (r *refreshTokenRepositoryImpl) Delete(ctx context.Context, refreshTokenID *vo.UUID) error {
	// Implement the method
	return nil
}

func NewRefreshTokenRepository() RefreshTokenRepository {
	return &refreshTokenRepositoryImpl{}
}
