package repository

import (
	"be-app/internal/apps/domain/entity"

	"gorm.io/gorm"
)

type RefreshTokenRepo struct{}

func NewRefreshTokenRepo() *RefreshTokenRepo {
	return &RefreshTokenRepo{}
}

func (r *RefreshTokenRepo) FindByUserID(db *gorm.DB, userID string, rt *entity.RefreshToken) error {
	return db.Where("user_id = ?", userID).First(&rt).Error
}

func (r *RefreshTokenRepo) DeleteByUserID(db *gorm.DB, userID string) error {
	return db.Where("user_id = ?", userID).Delete(&entity.RefreshToken{}).Error
}

func (r *RefreshTokenRepo) Create(db *gorm.DB, rt *entity.RefreshToken) error {
	return db.Create(rt).Error
}

