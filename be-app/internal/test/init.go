package test

import (
	"be-app/internal/app/domain/friend"
	"be-app/internal/app/domain/user"
	userprofile "be-app/internal/app/domain/user_profile"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func init() {
	db, _ = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&user.User{}, &userprofile.UserProfile{}, &friend.Friend{})
}
