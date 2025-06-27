package refreshtoken

import "gorm.io/gorm"

type Repo struct {
}

func NewRepo() Repo {
	return Repo{}
}

func (r Repo) Create(db *gorm.DB, rt *RefreshToken) error {
	return db.Create(rt).Error
}

func (r Repo) FindByUserId(db *gorm.DB, user_id string, rt *RefreshToken) error {
	return db.Where("user_id = ?", user_id).First(&rt).Error
}

func (r Repo) FindByToken(db *gorm.DB, token string, rt *RefreshToken) error {
	return db.Where("token = ? ", token).First(&rt).Error
}

func (r Repo) DeleteByUserId(db *gorm.DB, user_id string) error {
	return db.Where("user_id = ?", user_id).Delete(&RefreshToken{}).Error
}
