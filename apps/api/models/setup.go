package models

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDataBase() {

	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", dbUser, dbPass, dbHost, dbPort, dbName)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Could not connect to the database", err)
	}

	// Define the User struct and run migrations for it.
	type User struct {
		ID        uint           `gorm:"primaryKey"`
		UUID      string         `gorm:"type:char(36);not null;uniqueIndex"` // UUIDv7
		Name      string         `gorm:"type:varchar(100);not null"`
		Email     string         `gorm:"type:varchar(320);unique;not null"`
		Password  string         `gorm:"not null"`
		CreatedAt time.Time      `gorm:"not null"`
		UpdatedAt time.Time      `gorm:"not null"`
		DeletedAt gorm.DeletedAt `gorm:"index"`
	}
	// DB.Migrator().DropTable(&User{}) // Uncomment this line to drop the table if it exists
	DB.AutoMigrate(&User{})
}
