package token

import (
	"fmt"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

var (
	httpOnlyCookieName string
	apiSecret          string
)

func init() {
	httpOnlyCookieName = os.Getenv("HTTP_ONLY_COOKIE_NAME")
	if httpOnlyCookieName == "" {
		httpOnlyCookieName = "accessTokenFromGoBackend"
	}
	apiSecret = os.Getenv("API_SECRET")
	if apiSecret == "" {
		apiSecret = "apiSecret"
	}
}

// 指定されたユーザーIDに基づいてJWTトークンを生成する
func GenerateToken(id uint, expiresInSec int) (string, error) {
	claims := jwt.MapClaims{}
	claims["authorized"] = true
	claims["user_id"] = id
	claims["exp"] = time.Now().Add(time.Duration(expiresInSec) * time.Second).Unix()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(apiSecret))
}

// Authorization headerからトークンを抽出抽出する場合
// func extractTokenFromString(c *gin.Context) string {
// 	bearerToken := c.Request.Header.Get("Authorization")
// 	strArr := strings.Split(bearerToken, " ")
// 	if len(strArr) == 2 {
// 		return strArr[1]
// 	}
// 	return ""
// }

func extractTokenFromCookie(c *gin.Context) string {
	cookie, err := c.Cookie(httpOnlyCookieName)
	if err != nil {
		return ""
	}
	return cookie
}

func parseToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("there was an error")
		}
		return []byte(apiSecret), nil
	})

	if err != nil {
		return nil, err
	}

	return token, nil
}

// トークンが有効かどうかを検証
func TokenValid(c *gin.Context) error {
	tokenString := extractTokenFromCookie(c)

	token, err := parseToken(tokenString)

	if err != nil {
		return err
	}

	if !token.Valid {
		return fmt.Errorf("invalid token")
	}

	return nil
}

// トークンからユーザーIDを取得
func ExtractTokenId(c *gin.Context) (uint, error) {
	tokenString := extractTokenFromCookie(c)

	token, err := parseToken(tokenString)

	if err != nil {
		return 0, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if ok && token.Valid {
		userId, ok := claims["user_id"].(float64)

		if !ok {
			return 0, nil
		}

		return uint(userId), nil
	}

	return 0, nil
}
