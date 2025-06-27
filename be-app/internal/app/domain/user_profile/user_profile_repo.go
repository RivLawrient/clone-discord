package userprofile

import (
	"be-app/internal/errs"

	"gorm.io/gorm"
)

type Repo struct {
}

func NewRepo() Repo {
	return Repo{}
}

func (r Repo) Create(db *gorm.DB, profile *UserProfile) error {
	return db.Create(profile).Error
}

func (r Repo) CheckUsernameDuplicate(db *gorm.DB, username string) error {
	var count int64
	err := db.Model(&UserProfile{}).Where("username = ?", username).Count(&count).Error
	if err != nil {
		return err
	}

	if count > 0 {
		return errs.ErrEmailUsed
	}

	return nil
}
