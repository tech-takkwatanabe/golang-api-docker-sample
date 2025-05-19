package dto

import "go-auth/domain/vo"

// UserDTO represents the user data transfer object
// @swagger:model
type UserDTO struct {
	// @description ユーザーID
	// @example 1
	ID uint `json:"id"`
	// @description ユーザーUUID
	// @example "550e8400-e29b-41d4-a716-446655440000"
	UUID vo.UUID `json:"uuid"`
	// @description ユーザー名
	// @example "山田太郎"
	Name vo.Name `json:"name"`
	// @description メールアドレス
	// @example "user@example.com"
	Email vo.Email `json:"email"`
	// @description 作成日時（RFC3339形式）
	// @example "2024-03-21T12:34:56.789Z"
	CreatedAt vo.DateTime `json:"created_at"`
	// @description 更新日時（RFC3339形式）
	// @example "2024-03-21T12:34:56.789Z"
	UpdatedAt vo.DateTime `json:"updated_at"`
}

type UserDTOResponse struct {
	Data *UserDTO `json:"data"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}
