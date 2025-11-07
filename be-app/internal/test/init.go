package test

import (
	categorychannel "be-app/internal/app/domain/category_channel"
	"be-app/internal/app/domain/channel"
	"be-app/internal/app/domain/friend"
	joinserver "be-app/internal/app/domain/join_server"
	refreshtoken "be-app/internal/app/domain/refresh_token"
	"be-app/internal/app/domain/server"
	textchatuser "be-app/internal/app/domain/text_chat_user"
	"be-app/internal/app/domain/user"
	userprofile "be-app/internal/app/domain/user_profile"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func init() {
	db, _ = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(
		&user.User{},
		&userprofile.UserProfile{},
		&refreshtoken.RefreshToken{},
		&friend.Friend{},
		&textchatuser.TextChatUser{},
		&server.Server{},
		&joinserver.JoinServer{},
		&categorychannel.CategoryChannel{},
		&channel.Channel{},
	)
}
