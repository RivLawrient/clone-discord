package configs

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewDB() *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	// db.Migrator().DropTable(&user.User{}, &userprofile.UserProfile{}, &refreshtoken.RefreshToken{}, &friend.Friend{})
	// db.AutoMigrate(&user.User{}, &userprofile.UserProfile{}, &refreshtoken.RefreshToken{}, &friend.Friend{})

	return db
}
