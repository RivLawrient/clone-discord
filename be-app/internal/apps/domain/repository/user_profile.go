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

func (r *UserProfileRepo) UpdateUsernameByUserID(db *gorm.DB, userID string, username string) error {
	return db.Model(&entity.UserProfile{}).Where("user_id = ?", userID).Update("username", username).Error
}

func (r *UserProfileRepo) UpdateNameByUserid(db *gorm.DB, userID string, name string) error {
	return db.Model(&entity.UserProfile{}).Where("user_id = ?", userID).Update("name", name).Error
}

func (r *UserProfileRepo) UpdateBannerColorByUserid(db *gorm.DB, userID string, banner_color string) error {
	return db.Model(&entity.UserProfile{}).Where("user_id = ?", userID).Update("banner_color", banner_color).Error
}

func (r *UserProfileRepo) UpdateBioByUserid(db *gorm.DB, userID string, bio string) error {
	return db.Model(&entity.UserProfile{}).Where("user_id = ?", userID).Update("bio", bio).Error
}

func (r *UserProfileRepo) UpdateAvatarByUserid(db *gorm.DB, userID string, avatar string) error {
	return db.Model(&entity.UserProfile{}).Where("user_id = ?", userID).Update("avatar", avatar).Error
}

func (r *UserProfileRepo) GetUserIDByUsername(db *gorm.DB, username string, userID *string) error {
	var profile entity.UserProfile
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

func (r *UserProfileRepo) UpdateStatusActivityByUserID(db *gorm.DB, userID string, status string) error {
	return db.Model(&entity.UserProfile{}).Where("user_id = ?", userID).Update("status_activity", status).Error
}

func (r *UserProfileRepo) GetByUserID(db *gorm.DB, userID string, data *entity.UserProfile) error {
	return db.Where("user_id = ?", userID).First(data).Error
}

func (r *UserProfileRepo) GetByListUserID(db *gorm.DB, userID []string, data *[]entity.UserProfile) error {
	return db.Where("user_id IN ?", userID).Find(data).Error
}

func (R *UserProfileRepo) GetByUsernamer(db *gorm.DB, username string, data *entity.UserProfile) error {
	return db.Where("username = ?", username).First(data).Error
}
