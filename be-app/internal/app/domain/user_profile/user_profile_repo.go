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
		return errs.ErrUsernameUsed
	}

	return nil
}

func (r Repo) GetUserIDByUsername(db *gorm.DB, username string, userID *string) error {
	var profile UserProfile
	err := db.Select("user_id").Where("username = ?", username).First(&profile).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errs.ErrUserNotFound // error custom kalau data gak ketemu
		}
		return err
	}

	*userID = profile.UserId
	return nil
}

func (r Repo) UpdateStatusActivity(db *gorm.DB, userID string, status string) error {
	err := db.Model(UserProfile{}).Where("user_id = ?", userID).Update("status_activity", status).Error
	if err != nil {
		return err
	}

	return nil
}
