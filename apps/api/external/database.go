package external

import (
	"fmt"
	"go-auth/config"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// ConnectDB はデータベースに接続し、*gorm.DB インスタンスを返します。
// この関数はグローバル変数を設定せず、接続インスタンスを返すことに専念します。
func ConnectDB() *gorm.DB {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		config.DBUser,
		config.DBPassword,
		config.DBHost,
		config.DBPort,
		config.DBName,
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connection established")
	return db
}
