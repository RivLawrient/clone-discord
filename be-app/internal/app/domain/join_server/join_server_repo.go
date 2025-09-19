package joinserver

import (
	"be-app/internal/dto"

	"gorm.io/gorm"
)

type Repo struct {
}

func NewREpo() Repo {
	return Repo{}
}

func (r Repo) JoinNewServer(db *gorm.DB, join *JoinServer) error {
	return db.Create(join).Error
}

func (r Repo) JoinBatchNewServer(db *gorm.DB, join []*JoinServer) error {
	return db.Create(join).Error
}

func (r Repo) GetListByUserId(db *gorm.DB, data *[]dto.ServerList, userid string) error {
	return db.Table("join_server").
		Select("server.id, server.name, join_server.position").
		Joins("JOIN server ON server.id = join_server.server_id").
		Where("join_server.user_id = ?", userid).
		Order("position ASC").
		Scan(data).Error
}
