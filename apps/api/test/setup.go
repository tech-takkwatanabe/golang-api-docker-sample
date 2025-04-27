package test

import (
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func setupTestDB() (*gorm.DB, error) {
	dsn := "user:password@tcp(mysql_test)/go_auth_test?charset=utf8mb4&parseTime=True&loc=Local"
	DB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	type User struct {
		ID        uint           `gorm:"primaryKey"`
		UUID      string         `gorm:"type:char(36);not null;uniqueIndex"`
		Name      string         `gorm:"type:varchar(100);not null"`
		Email     string         `gorm:"type:varchar(320);unique;not null"`
		Password  string         `gorm:"not null"`
		CreatedAt time.Time      `gorm:"not null"`
		UpdatedAt time.Time      `gorm:"not null"`
		DeletedAt gorm.DeletedAt `gorm:"index"`
	}
	DB.Migrator().DropTable(&User{})
	DB.AutoMigrate(&User{})
	return DB, nil
}
