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

func (r Repo) GetByUserId(db *gorm.DB, userId string, profile *UserProfile) error {
	return db.Where("user_id = ?", userId).First(profile).Error
}

func (r Repo) GetListByListUserId(db *gorm.DB, userId []string, profile *[]UserProfile) error {
	return db.Where("user_id IN ?", userId).Find(profile).Error
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

	*userID = profile.UserID
	return nil
}

func (r Repo) UpdateStatusActivity(db *gorm.DB, userID string, status string) error {
	err := db.Model(&UserProfile{}).Where("user_id = ?", userID).Update("status_activity", status).Error
	if err != nil {
		return err
	}

	return nil
}

func (r Repo) GetByUsername(db *gorm.DB, username string, data *UserProfile) error {
	err := db.Model(&UserProfile{}).Where("username = ?", username).First(&data).Error
	if err != nil {
		return errs.ErrUserNotFound
	}

	return nil
}

func (r Repo) UpdateUsernameByUserId(db *gorm.DB, user_id string, username string) error {
	return db.Model(&UserProfile{}).Where("user_id = ?", user_id).Update("username", username).Error
}

func (r Repo) UpdateNameByUserid(db *gorm.DB, user_id string, name string) error {
	return db.Model(&UserProfile{}).Where("user_id = ?", user_id).Update("name", name).Error
}

func (r Repo) UpdateBannerColorByUserid(db *gorm.DB, user_id string, banner_color string) error {
	return db.Model(&UserProfile{}).Where("user_id = ?", user_id).Update("banner_color", banner_color).Error
}

func (r Repo) UpdateBioByUserid(db *gorm.DB, user_id string, bio string) error {
	return db.Model(&UserProfile{}).Where("user_id = ?", user_id).Update("bio", bio).Error
}

func (r Repo) UpdateAvatarByUserid(db *gorm.DB, user_id string, avatar string) error {
	return db.Model(&UserProfile{}).Where("user_id = ?", user_id).Update("avatar", avatar).Error
}
