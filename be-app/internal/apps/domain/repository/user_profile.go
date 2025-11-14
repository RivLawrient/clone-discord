package repository

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/errs"

	"gorm.io/gorm"
)

type UserProfileRepo struct{}

func NewUserProfileRepo() *UserProfileRepo {
	return &UserProfileRepo{}
}

func (r *UserProfileRepo) CheckUsernameDuplicate(db *gorm.DB, username string) error {
	var count int64
	err := db.Model(&entity.UserProfile{}).Where("username = ?", username).Count(&count).Error
	if err != nil {
		return err
	}

	if count > 0 {
		return errs.ErrUsernameUsed
	}

	return nil
}
