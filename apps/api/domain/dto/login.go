package dto

import "go-auth/domain/vo"

type LoginResponse struct {
	AccessToken  string     `json:"accessToken"`
	RefreshToken string     `json:"refreshToken"`
	User         UserSubDTO `json:"user"`
}

type UserSubDTO struct {
	Sub vo.UUID `json:"sub"`
}
