package categorychannel

import "gorm.io/gorm"

type Repo struct {
}

func NewRepo() Repo {
	return Repo{}
}

func (r Repo) NewCategory(db *gorm.DB, categoryChannel *CategoryChannel) error {
	return db.Create(categoryChannel).Error
}

func (r Repo) GetLastPostitionByServerId(db *gorm.DB, serverId string) (int, error) {
	var lastPosition int

	err := db.
		Model(&CategoryChannel{}).
		Where("server_id= ?", serverId).
		Select("COALESCE(MAX(position), 0)").
		Scan(&lastPosition).Error

	if err != nil {
		return 0, err
	}

	return lastPosition, nil
}

func (r Repo) GetById(db *gorm.DB, id string, categoryChannel *CategoryChannel) error {
	return db.Where("id = ?", id).First(categoryChannel).Error
}

func (r Repo) RemoveById(db *gorm.DB, id string) error {
	return db.Where("id = ?", id).Delete(&CategoryChannel{}).Error
}

func (r Repo) GetListByServerId(db *gorm.DB, serverId string, categoryChannel *[]CategoryChannel) error {
	return db.Where("server_id = ?", serverId).Find(categoryChannel).Error
}

func (r Repo) GetIdByPositionAndServerId(db *gorm.DB, serverId string, position int) (string, error) {
	var id string
	err := db.
		Model(&CategoryChannel{}).
		Select("id").
		Where("server_id = ? AND position = ?", serverId, position).
		Scan(&id).Error

	if err != nil {
		return "", err
	}

	return id, nil
}
