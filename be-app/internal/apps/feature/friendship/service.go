package friendship

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/apps/domain/repository"
	"be-app/internal/dto"
	"be-app/internal/errs"
	"log"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	DB              *gorm.DB
	FriendRepo      repository.FriendRepo
	UserRepo        repository.UserRepo
	UserProfileRepo repository.UserProfileRepo
}

func NewService(db *gorm.DB, friendRepo repository.FriendRepo, userRepo repository.UserRepo, userProfileRepo repository.UserProfileRepo) *Service {
	return &Service{
		DB:              db,
		FriendRepo:      friendRepo,
		UserRepo:        userRepo,
		UserProfileRepo: userProfileRepo,
	}
}

func (s *Service) NewRequestFriend(userID string, username string) (*entity.Friend, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	if err := s.UserProfileRepo.CheckUsernameDuplicate(tx, username); err != errs.ErrUsernameUsed {
		return nil, errs.ErrUserNotFound
	}

	log.Println("username")
	var uid string
	if err := s.UserProfileRepo.GetUserIDByUsername(tx, username, &uid); err != nil {
		return nil, err
	}

	if uid == userID {
		return nil, errs.ErrUserNotFound
	}

	if err := s.FriendRepo.CheckAdded(tx, userID, uid); err != nil {
		return nil, err
	}

	newFriend := entity.Friend{
		ID:         uuid.NewString(),
		SenderID:   userID,
		ReceiverID: uid,
		IsPending:  true,
	}

	if err := s.FriendRepo.Create(tx, &newFriend); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &newFriend, nil
}

func (s *Service) GetListAll(userID string) (*dto.GroupFriendList, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	all := []dto.FriendList{}
	sent := []dto.FriendList{}
	request := []dto.FriendList{}

	sender := []entity.Friend{}
	if err := s.FriendRepo.GetListBySender(tx, userID, &sender); err != nil {
		return nil, err
	}
	for _, v := range sender {
		newData := dto.FriendList{
			UserId:         v.Receiver.ID,
			IsPending:      v.IsPending,
			Name:           v.Receiver.UserProfile.Name,
			Username:       v.Receiver.UserProfile.Username,
			Avatar:         v.Receiver.UserProfile.Avatar,
			AvatarBg:       v.Receiver.UserProfile.AvatarBg,
			CreatedAt:      v.CreatedAt,
			StatusActivity: v.Receiver.UserProfile.StatusActivity,
		}

		if v.IsPending {
			sent = append(sent, newData)
		} else {
			all = append(all, newData)
		}
	}

	receiver := []entity.Friend{}
	if err := s.FriendRepo.GetListByReceiver(tx, userID, &receiver); err != nil {
		return nil, err
	}
	for _, v := range receiver {
		newData := dto.FriendList{
			UserId:         v.Sender.ID,
			IsPending:      v.IsPending,
			Name:           v.Sender.UserProfile.Name,
			Username:       v.Sender.UserProfile.Username,
			Avatar:         v.Sender.UserProfile.Avatar,
			AvatarBg:       v.Sender.UserProfile.AvatarBg,
			CreatedAt:      v.CreatedAt,
			StatusActivity: v.Sender.UserProfile.StatusActivity,
		}

		if v.IsPending {
			request = append(sent, newData)
		} else {
			all = append(all, newData)
		}
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

func (s *Service) AcceptRequest(userID string, otherUserID string) error {
	tx := s.DB.Begin()
	defer tx.Rollback()

	err := s.FriendRepo.SetPendingFalse(tx, userID, otherUserID)
	if err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *Service) DeclineRequest(userID string, otherUserID string) error {
	tx := s.DB.Begin()
	defer tx.Rollback()

	err := s.FriendRepo.RemoveByUserIDAndOther(tx, userID, otherUserID)
	if err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *Service) RemoveFriend(userID string, otherUserID string) error {
	tx := s.DB.Begin()
	defer tx.Rollback()

	err := s.FriendRepo.RemoveByUserIDAndOther(tx, userID, otherUserID)
	if err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}
