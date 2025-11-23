package repository

import (
	"be-app/internal/apps/domain/entity"

	"gorm.io/gorm"
)

type ChannelCategoryRepo struct{}

func NewChannelCategoryRepo() *ChannelCategoryRepo {
	return &ChannelCategoryRepo{}
}

func (r *ChannelCategoryRepo) GetLastPostitionByServerID(db *gorm.DB, serverID string) (int, error) {
	var lastPos int

	err := db.
		Model(&entity.ChannelCategory{}).
		Where("server_id = ?", serverID).
		Select("COALESCE(MAX(position), 0)").
		Scan(&lastPos).Error

	if err != nil {
		return 0, err
	}

	return lastPos, nil
}

func (r *ChannelCategoryRepo) Create(db *gorm.DB, category *entity.ChannelCategory) error {
	return db.Create(category).Error
}

func (r *ChannelCategoryRepo) GetByID(db *gorm.DB, ID string, channelCat *entity.ChannelCategory) error {
	return db.Where("id = ?", ID).First(channelCat).Error
}

func (r *ChannelCategoryRepo) GetListByServerID(db *gorm.DB, serverID string, channelCat *[]entity.ChannelCategory) error {
	return db.Where("server_id = ?", serverID).Find(channelCat).Error
}

func (r *ChannelCategoryRepo) RemoveByID(db *gorm.DB, ID string) error {
	return db.Where("id = ?", ID).Delete(&entity.ChannelCategory{}).Error
}

func (r *ChannelCategoryRepo) UpdateBatch(db *gorm.DB, list *[]entity.ChannelCategory) error {
	return db.Transaction(func(tx *gorm.DB) error {
		for _, item := range *list {
			if err := tx.Model(&entity.ChannelCategory{}).
				Where("id = ?", item.ID).
				Updates(item).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *ChannelCategoryRepo) GetIDByPositionAndServerID(db *gorm.DB, serverID string, position int) (string, error) {
	var id string
	err := db.
		Model(&entity.ChannelCategory{}).
		Select("id").
		Where("server_id = ? AND position = ?", serverID, position).
		Scan(&id).Error

	if err != nil {
		return "", err
	}

	return id, nil
}

func (r *ChannelCategoryRepo) Update(db *gorm.DB, data *entity.ChannelCategory) error {
	return db.Updates(data).Error
}
