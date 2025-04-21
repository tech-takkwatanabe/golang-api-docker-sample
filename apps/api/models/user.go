package models

import (
	"go-auth/domain/entity"
	"go-auth/utils/token"
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

type UserResponse struct {
	Data User `json:"data"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type TokenResponse struct {
	Token string `json:"token"`
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

func FindUserByID(id uint) (*entity.User, error) {
	var user entity.User
	if err := DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func CreateUser(user *entity.User) (*entity.User, error) {
	if err := DB.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func UpdateUser(user *entity.User) (*entity.User, error) {
	if err := DB.Save(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func DeleteUser(id uint) error {
	var user entity.User
	if err := DB.First(&user, id).Error; err != nil {
		return err
	}
	if err := DB.Delete(&user).Error; err != nil {
		return err
	}
	return nil
}
