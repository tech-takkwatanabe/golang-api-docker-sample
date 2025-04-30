package entity

import (
	"go-auth/domain/vo"
	"time"
)

type RefreshToken struct {
	RefreshTokenID *vo.UUID // user.uuid
	UserID         uint
	Token          string
	ExpiresAt      time.Time
	CreatedAt      time.Time
}
