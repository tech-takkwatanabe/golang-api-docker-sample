package controllers

import (
	"go-auth/config"
	"go-auth/domain/dto"
	"go-auth/domain/vo"
	"go-auth/service"
	"go-auth/usecase/user"
	"go-auth/utils/token"
	"net/http"

	"github.com/gin-gonic/gin"
)

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

		nameVO, err := vo.NewName(input.Name)
		if err != nil {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
			return
		}

		emailVO, err := vo.NewEmail(input.Email)
		if err != nil {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
			return
		}

		registerInput := user.RegisterInput{
			Name:     *nameVO,
			Email:    *emailVO,
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
// @Success      200    {object}  dto.LoginResponse	 "ログイン成功時のレスポンス"
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

		emailVO, err := vo.NewEmail(input.Email)
		if err != nil {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
			return
		}

		loginInput := user.LoginInput{
			Email:    *emailVO,
			Password: input.Password,
		}

		loginResponse, err := user.LoginUseCase(loginInput, userService)
		if err != nil {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: err.Error()})
			return
		}

		SetAuthCookies(c, loginResponse.AccessToken, loginResponse.RefreshToken)

		c.JSON(http.StatusOK, loginResponse)
	}
}

// CurrentUser godoc
// @Summary      現在のユーザー情報
// @Description  トークンを元にログイン中のユーザー情報を返す
// @Tags         auth
// @Produce      json
// @Security     AccessToken
// @Success      200  {object}  dto.UserDTOResponse
// @Failure      401  {object}   dto.ErrorResponse  "認証エラー"
// @Router       /loggedin/user [get]
func CurrentUser(userService service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uuid, err := token.ExtractTokenSub(c, config.AccessTokenCookieName)
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
// @Description  サーバーからリフレッシュトークンを無効化し、クライアントのCookieを削除します
// @Tags         auth
// @Produce      json
// @Security     AccessToken
// @Success      200  {object}  dto.MessageResponse  "ログアウト成功"
// @Router       /loggedin/logout [post]
func Logout(userService service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		user.LogoutUseCase(c, userService)

		ClearAuthCookies(c)

		c.JSON(http.StatusOK, dto.MessageResponse{Message: "Logged out successfully"})
	}
}

// Refresh godoc
// @Summary      トークンリフレッシュ
// @Description  リフレッシュトークンを使用して新しいアクセストークンを生成して返します
// @Tags         auth
// @Produce      json
// @Security     RefreshToken
// @Success      200  {object}  dto.TokenRefreshResponse
// @Failure      401  {object}   dto.ErrorResponse  "認証エラー"
// @Failure      400  {object}   dto.ErrorResponse  "リフレッシュトークンエラー"
// @Router       /loggedin/refresh [post]
func Refresh(userService service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		refreshTokenID, err := token.ExtractTokenJti(c, config.RefreshTokenCookieName)
		if err != nil {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Invalid refresh token"})
			return
		}

		TokenRefreshResponse, err := user.RefreshUseCase(c, refreshTokenID, userService)
		if err != nil {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: err.Error()})
			return
		}

		SetAuthCookies(c, TokenRefreshResponse.AccessToken, TokenRefreshResponse.RefreshToken)

		c.JSON(http.StatusOK, TokenRefreshResponse)
	}
}
