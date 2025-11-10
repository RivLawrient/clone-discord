package test

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func init() {
	db, _ = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	// db.AutoMigrate(
	// 	&user.User{},
	// 	&userprofile.UserProfile{},
	// 	&refreshtoken.RefreshToken{},
	// 	&friend.Friend{},
	// 	&textchatuser.TextChatUser{},
	// 	&server.Server{},
	// 	&joinserver.JoinServer{},
	// 	&categorychannel.CategoryChannel{},
	// 	&channel.Channel{},
	// )
}
