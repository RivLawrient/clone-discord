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

func (r *JoinServerRepo) GetByServerIDUserID(db *gorm.DB, serverID string, userID string, joinServer *entity.JoinServer) error {
	return db.Where("server_id = ? AND user_id = ?", serverID, userID).First(joinServer).Error
}

func (r *JoinServerRepo) GetListUserIDByServerID(db *gorm.DB, serverID string, id *[]string) error {
	return db.Model(&entity.JoinServer{}).Where("server_id = ?", serverID).Select("user_id").Find(id).Error
}

func (r *JoinServerRepo) GetListServerIDByUserID(db *gorm.DB, userID string, id *[]string) error {
	return db.Model(&entity.JoinServer{}).Where("user_id = ?", userID).Select("server_id").Find(id).Error
}

func (r *JoinServerRepo) GetListByUserID(db *gorm.DB, userID string, joinServers *[]entity.JoinServer) error {
	return db.Where("user_id = ?", userID).Preload("Server.Channel").Preload("Server.ChannelCategory.Channel").Find(joinServers).Error

}
