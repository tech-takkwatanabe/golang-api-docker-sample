package models

import (
	"log"
	"time"

	"gorm.io/gorm"
)

func DBMigrate(db *gorm.DB) {
	log.Println("Running Migrations...")

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

	err := db.AutoMigrate(&User{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migration finished successfully.")
}
