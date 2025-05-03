package dto

type LoginResponse struct {
	AccessToken string     `json:"accessToken"`
	User        UserSubDTO `json:"user"`
}

type UserSubDTO struct {
	Sub string `json:"sub"`
}
