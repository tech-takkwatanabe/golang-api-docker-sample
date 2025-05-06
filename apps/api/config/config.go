package config

import (
	"log"
	"os"
	"strconv"
)

var (
	AccessTokenExpireSeconds         int
	RefreshTokenExpireSeconds        int
	AccessTokenCookieName            string
	RefreshTokenCookieName           string
	AuthCheckCookieName              string
	RefreshTokenExistCheckCookieName string
)

func LoadConfig() {
	var err error
	AccessTokenExpireSeconds, err = strconv.Atoi(os.Getenv("ACCESS_TOKEN_EXPIRE_SECONDS"))
	if err != nil {
		AccessTokenExpireSeconds = 3600 * 24
	}

	RefreshTokenExpireSeconds, err = strconv.Atoi(os.Getenv("REFRESH_TOKEN_EXPIRE_SECONDS"))
	if err != nil {
		RefreshTokenExpireSeconds = 3600 * 24 * 7
	}

	AccessTokenCookieName = os.Getenv("ACCESS_TOKEN_COOKIE_NAME")
	if AccessTokenCookieName == "" {
		AccessTokenCookieName = "accessTokenFromGoBackend"
	}

	RefreshTokenCookieName = os.Getenv("REFRESH_TOKEN_COOKIE_NAME")
	if RefreshTokenCookieName == "" {
		RefreshTokenCookieName = "refreshTokenFromGoBackend"
	}

	AuthCheckCookieName = os.Getenv("AUTH_CHECK_COOKIE_NAME")
	if AuthCheckCookieName == "" {
		AuthCheckCookieName = "isAuthenticatedByGoBackend"
	}

	RefreshTokenExistCheckCookieName = os.Getenv("REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME")
	if RefreshTokenExistCheckCookieName == "" {
		RefreshTokenExistCheckCookieName = "refreshTokenByGoBackendExists"
	}

	if AccessTokenExpireSeconds == 0 || RefreshTokenExpireSeconds == 0 {
		log.Println("Warning: some configuration values are using default values.")
	}
}
