package token

import (
	"errors"
	"fmt"
	"go-auth/domain/vo"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var (
	jwtSecret string
)

func init() {
	jwtSecret = os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "jwtSecret"
	}
}

// トークン生成
func GenerateToken(uuid vo.UUID, expiresInSec int) (string, error) {
	// generate jti (JWT ID) as a random string
	jti := vo.NewUUIDv7()
	claims := jwt.MapClaims{
		"authorized": true,
		"iat":        time.Now().Unix(),
		"jti":        jti,
		"iss":        "go-auth",
		"aud":        "go-auth",
		"sub":        uuid.String(),
		"exp":        time.Now().Add(time.Duration(expiresInSec) * time.Second).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtSecret))
}

// Authorization header からトークン取得の場合
// func extractTokenFromHeader(c *gin.Context) string {
// 	bearerToken := c.Request.Header.Get("Authorization")
// 	strArr := strings.Split(bearerToken, " ")
// 	if len(strArr) == 2 {
// 		return strArr[1]
// 	}
// 	return ""
// }

// 任意の Cookie 名からトークンを取得
func extractTokenFromCookie(c *gin.Context, cookieName string) string {
	cookie, err := c.Cookie(cookieName)
	if err != nil {
		return ""
	}
	return cookie
}

// トークンパース（v5 のパース関数は引数が増えている）
func parseToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// 署名方法がHMACであることを検証
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})
}

// トークンが有効かチェック
func TokenValid(c *gin.Context, cookieName string) error {
	tokenString := extractTokenFromCookie(c, cookieName)
	token, err := parseToken(tokenString)
	if err != nil {
		return err
	}

	if !token.Valid {
		return fmt.Errorf("invalid token")
	}

	return nil
}

// uuid を sub claim から取得
func ExtractTokenSub(c *gin.Context, cookieName string) (vo.UUID, error) {
	tokenString := extractTokenFromCookie(c, cookieName)
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
