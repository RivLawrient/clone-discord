package categorychannel

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

func (r Repo) GetListByListServerId(db *gorm.DB, serversId []string, cat *[]CategoryChannel) error {
	return db.Where("server_id IN ?", serversId).Find(cat).Error
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

func (r Repo) UpdateBatch(db *gorm.DB, categories []CategoryChannel) error {
	if len(categories) == 0 {
		return nil
	}

	// Susun bagian CASE untuk setiap kolom yang ingin diupdate
	caseName := "CASE id"
	casePosition := "CASE id"
	ids := make([]string, 0, len(categories))

	for _, cat := range categories {
		caseName += " WHEN '" + cat.ID + "' THEN '" + cat.Name + "'"
		casePosition += " WHEN '" + cat.ID + "' THEN " + fmt.Sprint(cat.Position)
		ids = append(ids, "'"+cat.ID+"'")
	}

	caseName += " END"
	casePosition += " END"

	// Gabungkan semua ID untuk filter WHERE
	idList := strings.Join(ids, ",")

	// Bangun query final
	query := fmt.Sprintf(`
		UPDATE category_channel
		SET 
			name = %s,
			position = %s,
			updated_at = NOW()
		WHERE id IN (%s)
	`, caseName, casePosition, idList)

	return db.Exec(query).Error
}
