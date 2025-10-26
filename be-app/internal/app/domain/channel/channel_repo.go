package channel

import (
	"fmt"
	"strings"

	"gorm.io/gorm"
)

type Repo struct {
}

func NewRepo() Repo {
	return Repo{}
}

func (r Repo) NewServer(db *gorm.DB, channel *Channel) error {
	return db.Create(channel).Error
}

func (r Repo) GetLastPostitionByServerId(db *gorm.DB, serverId string, categoryId *string) (int, error) {
	var lastPosition int

	query := db.Model(&Channel{}).
		Where("server_id = ?", serverId)

	if categoryId != nil {
		query = query.Where("category_channel_id = ?", *categoryId)
	}

	err := query.
		Select("COALESCE(MAX(position), 0)").
		Scan(&lastPosition).Error

	if err != nil {
		return 0, err
	}

	return lastPosition, nil
}

func (r Repo) GetById(db *gorm.DB, id string, channel *Channel) error {
	return db.Where("id = ?", id).First(channel).Error
}

func (r Repo) RemoveById(db *gorm.DB, id string) error {
	return db.Where("id = ?", id).Delete(&Channel{}).Error
}

func (r Repo) GetListByServerId(db *gorm.DB, serverId string, channel *[]Channel) error {
	return db.Where("server_id = ?", serverId).Find(channel).Error
}

func (r Repo) GetListByServerIdWithoutCategory(db *gorm.DB, serverId string, channel *[]Channel) error {
	return db.Where("server_id = ? AND category_channel_id IS NULL", serverId).Find(channel).Order("position").Error
}

func (r Repo) ReorderPositionBatch(db *gorm.DB, serverId string, channel *[]Channel) error {
	if len(*channel) == 0 {
		return nil
	}

	query := "UPDATE join_servers SET position = CASE"
	ids := make([]string, 0, len(*channel))

	for _, j := range *channel {
		query += fmt.Sprintf(" WHEN id = '%s' THEN %d", j.ID, j.Position)
		ids = append(ids, fmt.Sprintf("'%s'", j.ID))
	}

	query += fmt.Sprintf(" END WHERE id IN (%s)", strings.Join(ids, ","))

	return db.Exec(query).Error
}
