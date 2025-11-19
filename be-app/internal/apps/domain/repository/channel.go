package repository

import (
	"be-app/internal/apps/domain/entity"

	"gorm.io/gorm"
)

type ChannelRepo struct{}

func NewChannelRepo() *ChannelRepo {
	return &ChannelRepo{}
}

func (r *ChannelRepo) GetLastPostitionByServerID(db *gorm.DB, serverID string, categoryID *string) (int, error) {
	var lastPosition int

	query := db.Model(&entity.Channel{}).
		Where("server_id = ?", serverID)

	if categoryID != nil {
		query = query.Where("channel_category_id = ?", *categoryID)
	}

	err := query.
		Select("COALESCE(MAX(position), 0)").
		Scan(&lastPosition).Error

	if err != nil {
		return 0, err
	}

	return lastPosition, nil
}

func (r *ChannelRepo) Create(db *gorm.DB, channel *entity.Channel) error {
	return db.Create(channel).Error
}

func (r *ChannelRepo) GetByID(db *gorm.DB, id string, channel *entity.Channel) error {
	return db.Where("id = ?", id).First(channel).Error
}

func (r *ChannelRepo) GetListByServerIdWithoutCategory(db *gorm.DB, serverID string, channel *[]entity.Channel) error {
	return db.Where("server_id = ? AND channel_category_id IS NULL", serverID).Find(channel).Order("position").Error
}

func (r *ChannelRepo) GetListByServerIdWithCategory(db *gorm.DB, serverID string, categoryID string, channel *[]entity.Channel) error {
	return db.Where("server_id = ? AND channel_category_id = ?", serverID, categoryID).Find(channel).Order("position").Error
}

func (r *ChannelRepo) UpdateBatch(db *gorm.DB, list *[]entity.Channel) error {
	return db.Transaction(func(tx *gorm.DB) error {
		for _, v := range *list {
			if err := tx.Model(&entity.Channel{}).
				Where("id = ?", v.ID).
				Select("ChannelCategoryID", "Position").
				Updates(v).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *ChannelRepo) RemoveByID(db *gorm.DB, id string) error {
	return db.Where("id = ?", id).Delete(&entity.Channel{}).Error
}

func (r *ChannelRepo) GetListByServerID(db *gorm.DB, serverID string, channels *[]entity.Channel) error {
	return db.Where("server_id = ?", serverID).Find(channels).Error
}

func (r *ChannelRepo) GetByPositionAndServerIDOnCategory(db *gorm.DB, serverID string, categoryID string, position int, channel *entity.Channel) error {
	return db.Where("server_id = ? AND channel_category_id = ? AND position = ?", serverID, categoryID, position).First(channel).Error
}

func (r *ChannelRepo) GetByPositionAndServerID(db *gorm.DB, serverID string, position int, channel *entity.Channel) error {
	return db.Where("server_id = ? AND position = ? AND channel_category_id IS NULL", serverID, position).First(channel).Error
}
