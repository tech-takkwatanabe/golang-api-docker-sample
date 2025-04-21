package controllers

import (
	"go-auth/domain/dto"
	"go-auth/usecase/user"
	"go-auth/utils/token"
	"net/http"

	"github.com/gin-gonic/gin"
)

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
func Register(c *gin.Context) {
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
	userDTO, err := user.RegisterUseCase(registerInput)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.UserDTOResponse{Data: userDTO.ToDTO()})
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
// @Success      200    {object}  dto.UserDTOResponse
// @Failure      400    {object}   dto.ErrorResponse  "バリデーションエラー"
// @Failure      401    {object}   dto.ErrorResponse  "認証エラー"
// @Router       /login [post]
func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	loginInput := user.LoginInput{
		Email:    input.Email,
		Password: input.Password,
	}
	tokenStr, err := user.LoginUseCase(loginInput)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.TokenResponse{Token: tokenStr.Token})
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
func CurrentUser(c *gin.Context) {
	userId, err := token.ExtractTokenId(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: err.Error()})
		return
	}

	userDto, err := user.CurrentUserUseCase(userId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.UserDTOResponse{Data: userDto.ToDTO()})
}
