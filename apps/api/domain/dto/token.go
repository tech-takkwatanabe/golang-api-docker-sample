package dto

type TokenDTO struct {
	Token string `json:"token"`
}

type TokenResponse struct {
	Data *TokenDTO `json:"data"`
}
