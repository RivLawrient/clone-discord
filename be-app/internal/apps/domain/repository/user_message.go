package repository

import (
	"be-app/internal/apps/domain/entity"
	"time"

	"gorm.io/gorm"
)

type UserMessageRepo struct{}

func NewUserMessageRepo() *UserMessageRepo {
	return &UserMessageRepo{}
}

func (r *UserMessageRepo) Create(db *gorm.DB, data *entity.UserMessage) error {
	return db.Create(data).Error
}

func (r *UserMessageRepo) GetByID(db *gorm.DB, id string, data *entity.UserMessage) error {
	return db.Where("id = ?", id).Preload("Sender.UserProfile").Preload("Receiver.UserProfile").First(data).Error
}

func (r *UserMessageRepo) GetListBeforeTimeByTwoID(db *gorm.DB, firstID, secondID string, time time.Time, id string, limit int, list *[]entity.UserMessage) error {
	return db.
		Model(&entity.UserMessage{}).
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			firstID, secondID, secondID, firstID).
		Where("(created_at < ? OR (created_at = ? AND id < ?))", time, time, id).
		Order("created_at DESC, id DESC").
		Preload("Sender.UserProfile").
		Preload("Receiver.UserProfile").
		Limit(limit).
		Find(list).
		Error
}

func (r *UserMessageRepo) GetListByTwoID(db *gorm.DB, firstID, secondID string, limit int, list *[]entity.UserMessage) error {
	return db.
		Model(&entity.UserMessage{}).
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			firstID, secondID, secondID, firstID).
		Order("created_at DESC, id DESC").
		Preload("Sender.UserProfile").
		Preload("Receiver.UserProfile").
		Limit(limit).
		Find(list).
		Error
}

func (r *UserMessageRepo) Update(db *gorm.DB, data *entity.UserMessage) error {
	return db.Updates(data).Error
}

func (r *UserMessageRepo) Remove(db *gorm.DB, data *entity.UserMessage) error {
	return db.Delete(data).Error
}

func (r *UserMessageRepo) GetListOtherUserID(db *gorm.DB, userID string, list *[]string) error {
	return db.
		Table("user_message").
		Raw(`
		SELECT user_id
		FROM (
			SELECT 
				CASE 
					WHEN sender_id = ? THEN receiver_id
					ELSE sender_id
				END AS user_id,
				MAX(created_at) AS last_msg
			FROM user_message
			WHERE sender_id = ? OR receiver_id = ?
			GROUP BY user_id
		) AS t
		ORDER BY last_msg DESC
		`, userID, userID, userID).
		Scan(list).
		Error
}
