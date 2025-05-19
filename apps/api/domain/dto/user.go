package dto

// UserDTO represents the user data transfer object
// @swagger:model
type UserDTO struct {
	// @description ユーザーID
	// @example 1
	ID uint `json:"id"`
	// @description ユーザーUUID
	// @example "550e8400-e29b-41d4-a716-446655440000"
	UUID string `json:"uuid"` // 型は string
	// @description ユーザー名
	// @example "山田太郎"
	Name string `json:"name"` // 型は string
	// @description メールアドレス
	// @example "user@example.com"
	Email string `json:"email"` // 型は string
	// @description 作成日時（RFC3339形式）
	// @example "2024-03-21T12:34:56.789Z"
	CreatedAt string `json:"created_at"` // 型は string
	// @description 更新日時（RFC3339形式）
	// @example "2024-03-21T12:34:56.789Z"
	UpdatedAt string `json:"updated_at"` // 型は string
}

type UserDTOResponse struct {
	Data *UserDTO `json:"data"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}
