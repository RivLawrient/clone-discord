package auth

import (
	"be-app/internal/apps/domain/user"

	"gorm.io/gorm"
)

type Service struct {
	DB       *gorm.DB
	UserRepo user.Repo
}

func NewService(db *gorm.DB, userRepo user.Repo) Service {
	return Service{
		DB:       db,
		UserRepo: userRepo,
	}
}
