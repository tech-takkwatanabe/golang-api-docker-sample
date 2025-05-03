package dto

import "go-auth/domain/vo"

type LoginResponse struct {
	AccessToken string     `json:"accessToken"`
	User        UserSubDTO `json:"user"`
}

type UserSubDTO struct {
	Sub vo.UUID `json:"sub"`
}
