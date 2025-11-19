package repository

import (
	"be-app/internal/apps/domain/entity"

	"gorm.io/gorm"
)

type JoinServerRepo struct{}

func NewJoinServerRepo() *JoinServerRepo {
	return &JoinServerRepo{}
}

func (r *JoinServerRepo) Create(db *gorm.DB, data *entity.JoinServer) error {
	return db.Create(data).Error
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
	return db.
		Where("user_id = ?", userID).
		Preload("Server").Find(list).
		Order("position ASCJJ").
		Error
}

func (r *JoinServerRepo) GetByServerIDUserID(db *gorm.DB, serverID string, userID string, joinServer *entity.JoinServer) error {
	return db.
		Where("server_id = ? AND user_id = ?", serverID, userID).
		First(joinServer).
		Error
}

func (r *JoinServerRepo) GetListUserIDByServerID(db *gorm.DB, serverID string, id *[]string) error {
	return db.
		Model(&entity.JoinServer{}).
		Where("server_id = ?", serverID).
		Select("user_id").
		Find(id).
		Error
}

func (r *JoinServerRepo) GetListServerIDByUserID(db *gorm.DB, userID string, id *[]string) error {
	return db.
		Model(&entity.JoinServer{}).
		Where("user_id = ?", userID).
		Select("server_id").
		Find(id).
		Error
}

func (r *JoinServerRepo) GetListByUserID(db *gorm.DB, userID string, joinServers *[]entity.JoinServer) error {
	return db.
		Where("user_id = ?", userID).
		Preload("Server.Channel").
		Preload("Server.ChannelCategory.Channel").
		Find(joinServers).
		Error
}

func (r *JoinServerRepo) UpdateBatch(db *gorm.DB, list *[]entity.JoinServer) error {
	return db.Transaction(func(tx *gorm.DB) error {
		for _, v := range *list {
			if err := tx.
				Model(&entity.JoinServer{}).
				Where("id = ?", v.ID).
				Updates(v).
				Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *JoinServerRepo) CheckAlreadyJoin(db *gorm.DB, serverID string, userID string) (bool, error) {
	var count int64
	err := db.
		Model(&entity.JoinServer{}).
		Where("user_id = ? AND server_id = ?", userID, serverID).
		Count(&count).
		Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}
