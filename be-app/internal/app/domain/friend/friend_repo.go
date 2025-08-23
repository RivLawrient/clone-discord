package friend

import (
	"be-app/internal/dto"
	"be-app/internal/errs"

	"gorm.io/gorm"
)

type Repo struct {
}

func NewRepo() Repo {
	return Repo{}
}

func (r Repo) NewFriendRequest(db *gorm.DB, friend *Friend) error {
	return db.Create(friend).Error
}

func (r Repo) CheckAdded(db *gorm.DB, user_id string, other_user_id string) error {
	var count int64
	err := db.
		Model(&Friend{}).
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", user_id, other_user_id, other_user_id, user_id).
		Count(&count).Error
	if err != nil {
		return err
	}
	if count > 0 {
		return errs.ErrFriendAdded
	}
	return nil
}

func (r Repo) GetListByUserId(db *gorm.DB, user_id string, list *[]dto.FriendList) error {
	query := `
		SELECT 
			CASE 
				WHEN f.sender_id = ? THEN f.receiver_id
				ELSE f.sender_id
			END AS user_id,
			f.is_pending,
			up.name,
			up.username,
			up.avatar,
			f.created_at,
			up.status_activity
		FROM friend f
		JOIN user_profile up 
			ON up.user_id = CASE 
				WHEN f.sender_id = ? THEN f.receiver_id
				ELSE f.sender_id
			END
		WHERE (f.sender_id = ? OR f.receiver_id = ?) AND f.is_pending = false
	`
	err := db.Raw(query, user_id, user_id, user_id, user_id).Scan(&list).Error
	if err != nil {
		return err
	}
	return nil
}

func (r Repo) GetListSentByUserId(db *gorm.DB, user_id string, list *[]dto.FriendList) error {
	query := `
		SELECT
			f.receiver_id AS user_id,
			f.is_pending,
			up.name,
			up.username,
			up.avatar,
			f.created_at,
			up.status_activity
		FROM friend f
		JOIN user_profile up ON up.user_id = f.receiver_id
		WHERE f.sender_id = ? AND f.is_pending = true
	`
	err := db.Raw(query, user_id).Scan(&list).Error
	if err != nil {
		return err
	}
	return nil
}

func (r Repo) GetListRequestByUserId(db *gorm.DB, user_id string, list *[]dto.FriendList) error {
	query := `
		SELECT
			f.sender_id AS user_id,
			f.is_pending,
			up.name,
			up.username,
			up.avatar,
			f.created_at,
			up.status_activity
		FROM friend f
		JOIN user_profile up ON up.user_id = f.sender_id
		WHERE f.receiver_id = ? AND f.is_pending = true
	`
	err := db.Raw(query, user_id).Scan(&list).Error
	if err != nil {
		return err
	}

	return nil
}
