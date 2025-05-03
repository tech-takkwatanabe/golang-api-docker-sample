package token

import (
	"errors"
	"fmt"
	"go-auth/domain/vo"
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

// 指定されたuuidに基づいてJWTトークンを生成する
func GenerateToken(uuid vo.UUID, expiresInSec int) (string, error) {
	claims := jwt.MapClaims{}
	claims["authorized"] = true
	claims["sub"] = uuid.String()
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

// トークンからsub（uuid）を取得
func ExtractTokenSub(c *gin.Context) (vo.UUID, error) {
	tokenString := extractTokenFromCookie(c)

	token, err := parseToken(tokenString)
	if err != nil {
		return vo.UUID{}, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return vo.UUID{}, errors.New("invalid token")
	}

	sub, ok := claims["sub"].(string)
	if !ok {
		return vo.UUID{}, errors.New("sub claim not found or not a string")
	}

	uuidVO, err := vo.NewUUID(sub)
	if err != nil {
		return vo.UUID{}, fmt.Errorf("invalid uuid format: %w", err)
	}

	return *uuidVO, nil
}
