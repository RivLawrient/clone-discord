package repository

import (
	"be-app/internal/apps/domain/entity"
	"time"

	"gorm.io/gorm"
)

type ChannelMessageRepo struct {
}

func NewChannelMessageRepo() *ChannelMessageRepo {
	return &ChannelMessageRepo{}
}

func (r *ChannelMessageRepo) Create(db *gorm.DB, data *entity.ChannelMessage) error {
	return db.Create(data).Error
}

func (r *ChannelMessageRepo) GetByID(db *gorm.DB, id string, data *entity.ChannelMessage) error {
	return db.Where("id = ?", id).Preload("Channel").First(data).Error
}

func (r *ChannelMessageRepo) GetListBeforeTimeByChannelID(db *gorm.DB, channelID string, time time.Time, id string, limit int, list *[]entity.ChannelMessage) error {
	return db.
		Model(&entity.ChannelMessage{}).
		Where("channel_id = ?", channelID).
		Where("(created_at < ? OR (created_at = ? AND id < ?))", time, time, id).
		Order("created_at DESC, id DESC").
		Preload("User.UserProfile").
		Limit(limit).
		Find(list).
		Error
}

func (r *ChannelMessageRepo) GetListByChannelID(db *gorm.DB, channelID string, limit int, list *[]entity.ChannelMessage) error {
	return db.
		Model(&entity.ChannelMessage{}).
		Where("channel_id =  ?", channelID).
		Order("created_at DESC, id DESC").
		Preload("User.UserProfile").
		Limit(limit).
		Find(list).
		Error
}

func (r *ChannelMessageRepo) Update(db *gorm.DB, data *entity.ChannelMessage) error {
	return db.Updates(data).Error
}

func (r *ChannelMessageRepo) Delete(db *gorm.DB, data *entity.ChannelMessage) error {
	return db.Delete(data).Error
}
