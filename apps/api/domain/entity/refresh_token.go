package entity

import (
	"go-auth/domain/vo"
	"time"
)

type RefreshToken struct {
	RefreshTokenID *vo.UUID // user.uuid
	UserID         uint
	Token          string
	ExpiresAt      int64
	CreatedAt      time.Time
}
