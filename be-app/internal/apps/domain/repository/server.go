package repository

import (
	"be-app/internal/apps/domain/entity"

	"gorm.io/gorm"
)

type ServerRepo struct{}

func NewServerRepo() *ServerRepo {
	return &ServerRepo{}
}

func (r *ServerRepo) Create(db *gorm.DB, server *entity.Server) error {
	return db.Create(server).Error
}

func (r *ServerRepo) GetListByInviteCode(db *gorm.DB, code string, server *entity.Server) error {
	return db.Where("invite_code = ?", code).Preload("JoinServer.User.UserProfile").First(server).Error
}

func (r *ServerRepo) GetWithChannelAndCategory(db *gorm.DB, id string, server *entity.Server) error {
	return db.Where("id = ? ", id).Preload("Channel").Preload("ChannelCategory.Channel").First(server).Error
}

func (r *ServerRepo) GetByID(db *gorm.DB, id string, server *entity.Server) error {
	return db.Where("id = ?", id).Preload("JoinServer").First(server).Error
}

func (r *ServerRepo) Update(db *gorm.DB, server *entity.Server) error {
	return db.Updates(server).Error
}

func (r *ServerRepo) Delete(db *gorm.DB, server *entity.Server) error {
	return db.Delete(server).Error
}
