package controllers

import (
	"go-auth/domain/dto"
	"go-auth/service"
	"go-auth/usecase/user"
	"go-auth/utils/token"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

var (
	accessTokenExpireSeconds int
	httpOnlyCookieName       string
	authCheckCookieName      string
)

func init() {
	var err error
	accessTokenExpireSeconds, err = strconv.Atoi(os.Getenv("ACCESS_TOKEN_EXPIRE_SECONDS"))
	if err != nil {
		accessTokenExpireSeconds = 900
	}
	httpOnlyCookieName = os.Getenv("HTTP_ONLY_COOKIE_NAME")
	if httpOnlyCookieName == "" {
		httpOnlyCookieName = "accessTokenFromGoBackend"
	}
	authCheckCookieName = os.Getenv("AUTH_CHECK_COOKIE_NAME")
	if authCheckCookieName == "" {
		authCheckCookieName = "isAuthenticatedByGoBackend"
	}
}

// RegisterInput represents the input for user registration
// @swagger:model
// @swagger:parameters register
type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register godoc
// @Summary      新規ユーザー登録
// @Description  新しいユーザーを登録します
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input  body      RegisterInput       true  "登録情報"
// @Success      200    {object}  dto.UserDTOResponse  "登録成功時のレスポンス"
// @Failure      400    {object}  dto.ErrorResponse   "バリデーションエラー"
// @Router       /register [post]
func Register(userService service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input RegisterInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
			return
		}

		registerInput := user.RegisterInput{
			Name:     input.Name,
			Email:    input.Email,
			Password: input.Password,
		}

		userDTO, err := user.RegisterUseCase(registerInput, userService)
		if err != nil {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
			return
		}

		c.JSON(http.StatusOK, dto.UserDTOResponse{Data: userDTO})
	}
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Login godoc
// @Summary      ログイン
// @Description  メールアドレスとパスワードでログインし、JWT トークンを返します
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input  body      LoginInput           true  "ログイン情報"
// @Success      200    {object}  dto.TokenResponse
// @Failure      400    {object}   dto.ErrorResponse  "バリデーションエラー"
// @Failure      401    {object}   dto.ErrorResponse  "認証エラー"
// @Router       /login [post]
func Login(userService service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input LoginInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
			return
		}

		loginInput := user.LoginInput{
			Email:    input.Email,
			Password: input.Password,
		}

		tokenDTO, err := user.LoginUseCase(loginInput, userService)
		if err != nil {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: err.Error()})
			return
		}

		maxAge := accessTokenExpireSeconds

		c.SetCookie(
			httpOnlyCookieName,
			tokenDTO.Token,
			maxAge, // Max-Age
			"/",    // Path
			"",     // Domain (指定しない)
			false,  // Secure
			true,   // HttpOnly
		)

		c.SetCookie(
			authCheckCookieName,
			"true",
			maxAge, // Max-Age
			"/",    // Path
			"",     // Domain (指定しない)
			false,  // Secure
			false,  // HttpOnly
		)

		c.JSON(http.StatusOK, dto.TokenResponse{Data: tokenDTO})
	}
}

// CurrentUser godoc
// @Summary      現在のユーザー情報
// @Description  トークンを元にログイン中のユーザー情報を返す
// @Tags         auth
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  dto.UserDTOResponse
// @Failure      401  {object}   dto.ErrorResponse  "認証エラー"
// @Router       /loggedin/user [get]
func CurrentUser(userService service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uuid, err := token.ExtractTokenSub(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: err.Error()})
			return
		}

		userDto, err := user.CurrentUserUseCase(uuid, userService)
		if err != nil {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: err.Error()})
			return
		}

		c.JSON(http.StatusOK, dto.UserDTOResponse{Data: userDto})
	}
}

// Logout godoc
// @Summary      ログアウト
// @Description  アクセストークンのCookieを削除します
// @Tags         auth
// @Produce      json
// @Success      200  {object}  dto.MessageResponse  "ログアウト成功"
// @Router       /loggedin/logout [post]
func Logout() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.SetCookie(
			httpOnlyCookieName,
			"",    // 空にする
			-1,    // Max-Ageを負数にすると即時削除される
			"/",   // Path
			"",    // Domain（省略）
			false, // Secure（必要なら true に）
			true,  // HttpOnly
		)

		c.SetCookie(
			authCheckCookieName,
			"",
			-1,    // Max-Age
			"/",   // Path
			"",    // Domain (指定しない)
			false, // Secure
			false, // HttpOnly
		)

		c.JSON(http.StatusOK, dto.MessageResponse{Message: "Logged out successfully"})
	}
}
