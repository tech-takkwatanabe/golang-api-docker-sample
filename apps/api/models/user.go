package models

import (
	"go-auth/utils/token"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id"`
	UUID      string         `json:"uuid"`
	Name      string         `json:"name"`
	Email     string         `json:"email"`
	Password  string         `json:"password,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty"`
}

func (u *User) Save() (*User, error) {
	err := DB.Create(u).Error
	if err != nil {
		return nil, err
	}
	return u, nil
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

func (u *User) PrepareOutput() *User {
	u.Password = ""
	return u
}

// 認証用関数
func AuthenticateUser(email string, password string) (string, error) {
	var user User

	err := DB.Where("email = ?", email).First(&user).Error

	if err != nil {
		return "", err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))

	if err != nil {
		return "", err
	}

	token, err := token.GenerateToken(user.ID)

	if err != nil {
		return "", err
	}

	return token, nil
}
