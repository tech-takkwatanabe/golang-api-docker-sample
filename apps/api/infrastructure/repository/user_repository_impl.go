package repository

import (
	"go-auth/domain/entity"
	"go-auth/domain/repository"
	"go-auth/domain/vo"
	"go-auth/models"

	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

// NewUserRepository は userRepository の新しいインスタンスを生成します。
// DB接続をDI（依存性注入）で受け取ることで、グローバル変数への依存をなくします。
func NewUserRepository(db *gorm.DB) repository.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByID(id uint) (*entity.User, error) {
	var model models.User
	if err := r.db.First(&model, id).Error; err != nil {
		return nil, err
	}
	return models.ToEntity(&model)
}

func (r *userRepository) FindByUUID(uuid vo.UUID) (*entity.User, error) {
	var model models.User
	if err := r.db.Where("uuid = ?", uuid.String()).First(&model).Error; err != nil {
		return nil, err
	}
	return models.ToEntity(&model)
}

func (r *userRepository) FindByEmail(email vo.Email) (*entity.User, error) {
	var model models.User
	if err := r.db.Where("email = ?", email.String()).First(&model).Error; err != nil {
		return nil, err
	}
	return models.ToEntity(&model)
}

func (r *userRepository) Save(user *entity.User) error {
	modelUser := models.ToModel(user)

	// GORMのCreateは、成功すると引数のモデルのIDフィールドを更新します。
	if err := r.db.Create(modelUser).Error; err != nil {
		return err
	}

	// ドメインエンティティにも新しいIDを反映させます。
	user.ID = modelUser.ID
	return nil
}
