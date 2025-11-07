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
	return db.Where("server_id = ?", serverId).Find(channel).Order("position").Error
}

func (r Repo) GetListByListServerId(db *gorm.DB, serversId []string, channel *[]Channel) error {
	return db.Where("server_id IN ? ", serversId).Find(channel).Order("position").Error
}

func (r Repo) GetListByServerIdWithoutCategory(db *gorm.DB, serverId string, channel *[]Channel) error {
	return db.Where("server_id = ? AND category_channel_id IS NULL", serverId).Find(channel).Order("position").Error
}

func (rr Repo) GetListByServerIdWithCategory(db *gorm.DB, serverId string, categoryId string, channel *[]Channel) error {
	return db.Where("server_id = ? AND category_channel_id = ?", serverId, categoryId).Find(channel).Order("position").Error
}

func (r Repo) ReorderPositionBatch(db *gorm.DB, serverId string, channel *[]Channel) error {
	if len(*channel) == 0 {
		return nil
	}

	query := "UPDATE channel SET position = CASE"
	ids := make([]string, 0, len(*channel))

	for _, j := range *channel {
		query += fmt.Sprintf(" WHEN id = '%s' THEN %d", j.ID, j.Position)
		ids = append(ids, fmt.Sprintf("'%s'", j.ID))
	}

	query += fmt.Sprintf(" END WHERE id IN (%s)", strings.Join(ids, ","))

	fmt.Println(query)
	return db.Exec(query).Error
	// return nil
}

func (r Repo) GetByPositionAndServerIdOnCategory(db *gorm.DB, serverId string, categoryId string, position int, channel *Channel) error {
	return db.Where("server_id = ? AND category_channel_id = ? AND position = ?", serverId, categoryId, position).First(channel).Error
}
func (r Repo) GetByPositionAndServerId(db *gorm.DB, serverId string, position int, channel *Channel) error {
	return db.Where("server_id = ? AND position = ? AND category_channel_id IS NULL", serverId, position).First(channel).Error
}

func (r Repo) UpdateBatch(db *gorm.DB, channels []Channel) error {
	if len(channels) == 0 {
		return nil
	}

	caseName := "CASE id"
	casePosition := "CASE id"
	caseCategory := "CASE id"
	caseIsVoice := "CASE id"
	ids := make([]string, 0, len(channels))

	for _, ch := range channels {
		caseName += fmt.Sprintf(" WHEN '%s' THEN '%s'", ch.ID, ch.Name)
		casePosition += fmt.Sprintf(" WHEN '%s' THEN %d", ch.ID, ch.Position)

		// ✅ Cast ke uuid agar Postgres gak error
		if ch.CategoryChannelId != nil {
			caseCategory += fmt.Sprintf(" WHEN '%s' THEN '%s'::uuid", ch.ID, *ch.CategoryChannelId)
		} else {
			caseCategory += fmt.Sprintf(" WHEN '%s' THEN NULL::uuid", ch.ID)
		}

		caseIsVoice += fmt.Sprintf(" WHEN '%s' THEN %t", ch.ID, ch.IsVoice)
		ids = append(ids, fmt.Sprintf("'%s'", ch.ID))
	}

	caseName += " END"
	casePosition += " END"
	caseCategory += " END"
	caseIsVoice += " END"

	query := fmt.Sprintf(`
		UPDATE %s
		SET 
			name = %s,
			position = %s,
			category_channel_id = %s,
			is_voice = %s,
			updated_at = NOW()
		WHERE id IN (%s)
	`, (&Channel{}).TableName(), caseName, casePosition, caseCategory, caseIsVoice, strings.Join(ids, ","))

	return db.Exec(query).Error
}
