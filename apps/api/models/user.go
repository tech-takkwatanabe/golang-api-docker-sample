package models

import (
	"go-auth/domain/entity"
	"go-auth/domain/vo"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID        uint       `json:"id"`
	UUID      string     `json:"uuid"`
	Name      string     `json:"name"`
	Email     string     `json:"email"`
	Password  string     `json:"password,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	v7, err := uuid.NewV7()
	if err != nil {
		return err
	}
	u.UUID = v7.String()

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)

	u.Name = strings.ToLower(u.Name)
	u.Email = strings.ToLower(u.Email)

	return nil
}

func ToModel(user *entity.User) *User {
	return &User{
		ID:        user.ID,
		UUID:      user.UUID.String(),
		Name:      user.Name.String(),
		Email:     user.Email.String(),
		Password:  user.Password,
		CreatedAt: user.CreatedAt.Time(),
		UpdatedAt: user.UpdatedAt.Time(),
	}
}

func ToEntity(user *User) (*entity.User, error) {
	name, err := vo.NewName(user.Name)
	if err != nil {
		return nil, err
	}
	email, err := vo.NewEmail(user.Email)
	if err != nil {
		return nil, err
	}
	uuid, err := vo.NewUUID(user.UUID)
	if err != nil {
		return nil, err
	}
	createdAt := vo.NewDateTime(user.CreatedAt)
	updatedAt := vo.NewDateTime(user.UpdatedAt)

	return &entity.User{
		ID:        user.ID,
		UUID:      *uuid,
		Name:      *name,
		Email:     *email,
		Password:  user.Password,
		CreatedAt: *createdAt,
		UpdatedAt: *updatedAt,
	}, nil
}
