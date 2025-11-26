package configs

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func NewDB() *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s user=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	if pw := os.Getenv("DB_PASSWORD"); pw != "" {
		dsn = fmt.Sprintf(
			"host=%s user=%s  dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
			os.Getenv("DB_HOST"),
			os.Getenv("DB_USER"),
			os.Getenv("DB_NAME"),
			os.Getenv("DB_PORT"),
		)
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags),
			logger.Config{
				LogLevel: logger.Info,
				Colorful: true,
			},
		),
	})

	if err != nil {
		panic(err)
	}

	// db.Migrator().DropTable(
	// 	&entity.User{},
	// 	&entity.UserProfile{},
	// 	&entity.RefreshToken{},
	// 	&entity.Friend{},
	// 	&entity.Server{},
	// 	&entity.JoinServer{},
	// 	&entity.ChannelCategory{},
	// 	&entity.Channel{},
	// 	&entity.ChannelMessage{},
	// 	&entity.UserMessage{},
	// )
	// db.AutoMigrate(
	// 	&entity.User{},
	// 	&entity.UserProfile{},
	// 	&entity.RefreshToken{},
	// 	&entity.Friend{},
	// 	&entity.Server{},
	// 	&entity.JoinServer{},
	// 	&entity.ChannelCategory{},
	// 	&entity.Channel{},
	// 	&entity.ChannelMessage{},
	// 	&entity.UserMessage{},
	// )

	return db
}
