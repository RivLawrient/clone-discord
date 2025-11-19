package statusactivitiy

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/apps/domain/repository"
	"be-app/internal/dto"

	"gorm.io/gorm"
)

type StatusActivity string

const (
	StatusOnline  StatusActivity = "Online"
	StatusOffline StatusActivity = "Invisible"
	StatusIdle    StatusActivity = "Idle"
	StatusDND     StatusActivity = "Do Not Disturb"
)

type Service struct {
	DB              *gorm.DB
	UserProfileRepo repository.UserProfileRepo
	FriendRepo      repository.FriendRepo
}

func NewService(db *gorm.DB, userProfileRepo repository.UserProfileRepo, friendRepo repository.FriendRepo) *Service {
	return &Service{
		DB:              db,
		UserProfileRepo: userProfileRepo,
		FriendRepo:      friendRepo,
	}
}

func (s *Service) SetStatusUser(userID string, status StatusActivity) (*dto.StatusUpdate, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	if err := s.UserProfileRepo.UpdateStatusActivityByUserID(tx, userID, string(status)); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &dto.StatusUpdate{
		UserId:         userID,
		StatusActivity: string(status),
	}, nil
}

func (s *Service) UpdateStatusToFriendList(userID string, status StatusActivity) (*[]string, *dto.StatusUpdate, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	receiver := []entity.Friend{}
	if err := s.FriendRepo.GetListByReceiver(tx, userID, &receiver); err != nil {
		return nil, nil, err
	}

	sender := []entity.Friend{}
	if err := s.FriendRepo.GetListBySender(tx, userID, &sender); err != nil {
		return nil, nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, err
	}

	var data []string

	for _, v := range receiver {
		data = append(data, v.SenderID)
	}
	for _, v := range sender {
		data = append(data, v.ReceiverID)
	}

	return &data, &dto.StatusUpdate{
		UserId:         userID,
		StatusActivity: string(status),
	}, nil
}
