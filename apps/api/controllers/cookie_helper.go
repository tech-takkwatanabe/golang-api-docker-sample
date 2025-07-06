package controllers

import (
	"go-auth/config"

	"github.com/gin-gonic/gin"
)

func SetAuthCookies(c *gin.Context, accessToken, refreshToken string) {
	// NOTE: 本番環境では、'secure'フラグをtrue (HTTPS) にし、ドメインも設定ファイルから読み込むようにすることを推奨します。
	secureCookie := false // e.g., config.IsProduction()
	domain := ""          // e.g., config.CookieDomain()

	c.SetCookie(config.AccessTokenCookieName, accessToken, config.AccessTokenExpireSeconds, "/", domain, secureCookie, true)
	c.SetCookie(config.AuthCheckCookieName, "true", config.AccessTokenExpireSeconds, "/", domain, secureCookie, false)
	c.SetCookie(config.RefreshTokenCookieName, refreshToken, config.RefreshTokenExpireSeconds, "/", domain, secureCookie, true)
	c.SetCookie(config.RefreshTokenExistCheckCookieName, "true", config.RefreshTokenExpireSeconds, "/", domain, secureCookie, false)
}

func ClearAuthCookies(c *gin.Context) {
	secureCookie := false
	domain := ""

	c.SetCookie(config.AccessTokenCookieName, "", -1, "/", domain, secureCookie, true)
	c.SetCookie(config.AuthCheckCookieName, "", -1, "/", domain, secureCookie, false)
	c.SetCookie(config.RefreshTokenCookieName, "", -1, "/", domain, secureCookie, true)
	c.SetCookie(config.RefreshTokenExistCheckCookieName, "", -1, "/", domain, secureCookie, false)
}
