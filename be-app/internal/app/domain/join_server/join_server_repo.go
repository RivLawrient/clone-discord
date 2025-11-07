package joinserver

import (
	"be-app/internal/dto"

	"gorm.io/gorm"
)

type Repo struct {
}

func NewRepo() Repo {
	return Repo{}
}

func (r Repo) JoinNewServer(db *gorm.DB, join *JoinServer) error {
	return db.Create(join).Error
}

func (r Repo) GetListByUserId(db *gorm.DB, data *[]dto.ServerList, userid string) error {
	return db.Table("join_server").
		Select("server.id, server.name, server.profile_image, server.invite_code, join_server.position, join_server.is_owner").
		Joins("JOIN server ON server.id = join_server.server_id").
		Where("join_server.user_id = ?", userid).
		Order("position ASC").
		Scan(data).Error
}

func (r Repo) GetAlreadyJoin(db *gorm.DB, userID string, serverID string) (bool, error) {
	var count int64

	err := db.
		Model(&JoinServer{}).
		Where("user_id = ? AND server_id = ?", userID, serverID).
		Count(&count).
		Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r Repo) GetLastPositionByUserID(db *gorm.DB, userID string) (int, error) {
	var lastPosition int

	err := db.
		Model(&JoinServer{}).
		Where("user_id = ?", userID).
		Select("COALESCE(MAX(position), 0)").
		Scan(&lastPosition).Error

	if err != nil {
		return 0, err
	}

	return lastPosition, nil
}

func (r Repo) GetById(db *gorm.DB, serverId string, userId string, joinServer *JoinServer) error {
	return db.Where("server_id =  ? AND user_id = ?", serverId, userId).First(joinServer).Error
}

func (r Repo) GetListUserIdByServerId(db *gorm.DB, serverId string, id *[]string) error {
	return db.Model(&JoinServer{}).Where("server_id = ?", serverId).Select("user_id").Find(id).Error
}

func (r Repo) GetListServerIdByUserId(db *gorm.DB, userId string, id *[]string) error {
	return db.Model(&JoinServer{}).Where("user_id = ?", userId).Select("server_id").Find(id).Error
}
