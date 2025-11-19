package repository

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/errs"

	"gorm.io/gorm"
)

type FriendRepo struct{}

func NewFriendRepo() *FriendRepo {
	return &FriendRepo{}
}

func (r *FriendRepo) CheckAdded(db *gorm.DB, userID string, otherUserID string) error {
	var count int64
	err := db.
		Model(&entity.Friend{}).
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", userID, otherUserID, otherUserID, userID).
		Count(&count).Error
	if err != nil {
		return err
	}
	if count > 0 {
		return errs.ErrFriendAdded
	}
	return nil
}

func (r *FriendRepo) Create(db *gorm.DB, friend *entity.Friend) error {
	return db.Create(friend).Error
}

func (r *FriendRepo) GetListBySender(db *gorm.DB, userID string, friends *[]entity.Friend) error {
	return db.Where("sender_id = ?", userID).Preload("Receiver.UserProfile").Find(friends).Error
}

func (r *FriendRepo) GetListByReceiver(db *gorm.DB, userID string, friends *[]entity.Friend) error {
	return db.Where("receiver_id = ?", userID).Preload("Sender.UserProfile").Find(friends).Error
}

func (r *FriendRepo) SetPendingFalse(db *gorm.DB, userID string, otherUserID string) error {

	query := db.Model(&entity.Friend{}).Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", userID, otherUserID, otherUserID, userID).Update("is_pending", false)
	if query.Error != nil {
		return query.Error
	}

	if query.RowsAffected == 0 {
		return errs.ErrRequestFriendNotFound
	}

	return nil
}

func (r *FriendRepo) RemoveByUserIDAndOther(db *gorm.DB, userID string, otherUserID string) error {

	query := db.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", userID, otherUserID, otherUserID, userID).Delete(&entity.Friend{})

	if query.Error != nil {
		return query.Error
	}

	if query.RowsAffected == 0 {
		return errs.ErrRequestFriendNotFound
	}

	return nil
}

// func (r *FriendRepo) GetListUserIDFriendByUserID(db *gorm.DB, userID string, id *[]string) error {

// 	return nil

// }
