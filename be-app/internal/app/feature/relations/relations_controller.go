package relations

import (
	"be-app/internal/app/domain/friend"
	userprofile "be-app/internal/app/domain/user_profile"
	"be-app/internal/dto"
	"be-app/internal/errs"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Controller struct {
	DB          *gorm.DB
	FriendRepo  friend.Repo
	ProfileRepo userprofile.Repo
}

func NewController(db *gorm.DB, friendRepo friend.Repo, profileRepo userprofile.Repo) Controller {
	return Controller{
		DB:          db,
		FriendRepo:  friendRepo,
		ProfileRepo: profileRepo,
	}
}

func (c Controller) NewRequestFriend(username string, user_id string) (*friend.Friend, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	if err := c.ProfileRepo.CheckUsernameDuplicate(tx, username); err != errs.ErrUsernameUsed {
		return nil, errs.ErrUserNotFound
	}
	var uid string
	if err := c.ProfileRepo.GetUserIDByUsername(tx, username, &uid); err != nil {
		return nil, err
	}

	if uid == user_id {
		return nil, errs.ErrUserNotFound
	}

	if err := c.FriendRepo.CheckAdded(tx, user_id, uid); err != nil {
		return nil, err
	}

	new_friend := friend.Friend{
		ID:         uuid.NewString(),
		SenderId:   user_id,
		ReceiverId: uid,
		IsPending:  true,
	}

	if err := c.FriendRepo.NewFriendRequest(tx, &new_friend); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &friend.Friend{
		ID:         new_friend.ID,
		SenderId:   new_friend.SenderId,
		ReceiverId: new_friend.ReceiverId,
		IsPending:  new_friend.IsPending,
	}, nil
}

func (c Controller) ListRelations(user_id string) (*dto.GroupFriendList, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	all := []dto.FriendList{}
	sent := []dto.FriendList{}
	request := []dto.FriendList{}

	if err := c.FriendRepo.GetListByUserId(tx, user_id, &all); err != nil {
		return nil, err
	}

	if err := c.FriendRepo.GetListSentByUserId(tx, user_id, &sent); err != nil {
		return nil, err
	}

	if err := c.FriendRepo.GetListRequestByUserId(tx, user_id, &request); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &dto.GroupFriendList{
		All:     &all,
		Sent:    &sent,
		Request: &request,
	}, nil
}
