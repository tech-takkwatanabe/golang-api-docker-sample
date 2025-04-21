package models

import (
	"go-auth/domain/entity"
	"go-auth/domain/vo"
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

// ToModel converts entity.User to models.User
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

// ToEntity converts models.User to entity.User
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
	var user User
	if err := DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return ToEntity(&user)
}

func CreateUser(user *entity.User) (*entity.User, error) {
	modelUser := ToModel(user)
	if err := DB.Create(modelUser).Error; err != nil {
		return nil, err
	}
	return ToEntity(modelUser)
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
