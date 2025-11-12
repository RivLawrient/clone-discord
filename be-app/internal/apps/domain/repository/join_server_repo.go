package repository

import (
	"be-app/internal/apps/domain/entity"

	"gorm.io/gorm"
)

type JoinServerRepo struct{}

func NewJoinServerRepo() *JoinServerRepo {
	return &JoinServerRepo{}
}

func (r *JoinServerRepo) GetLastPositionByUserID(db *gorm.DB, userID string) (int, error) {
	var lastPosition int

	err := db.
		Model(&entity.JoinServer{}).
		Where("user_id = ?", userID).
		Select("COALESCE(MAX(position), 0)").
		Scan(&lastPosition).Error

	if err != nil {
		return 0, err
	}

	return lastPosition, nil
}

func (r *JoinServerRepo) GetListByUserIDWithJoin(db *gorm.DB, userID string, list *[]entity.JoinServer) error {
	return db.Where("user_id = ?", userID).Preload("Server").Find(list).Error
}
