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
	JoinServerRepo  repository.JoinServerRepo
}

func NewService(db *gorm.DB, userProfileRepo repository.UserProfileRepo, friendRepo repository.FriendRepo, joinServeRepo repository.JoinServerRepo) *Service {
	return &Service{
		DB:              db,
		UserProfileRepo: userProfileRepo,
		FriendRepo:      friendRepo,
		JoinServerRepo:  joinServeRepo,
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

func (s *Service) UpdateStatusToServerMember(userID string, status StatusActivity) (*[]string, *dto.StatusUpdate, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	join := []entity.JoinServer{}
	err := s.JoinServerRepo.GetListByUserID(tx, userID, &join)
	if err != nil {
		return nil, nil, err
	}

	ids := []string{}
	for _, v := range join {
		for _, vv := range v.Server.JoinServer {
			ids = append(ids, vv.UserID)
		}
	}

	uniqueIds := make([]string, 0)
	seen := make(map[string]bool)

	for _, id := range ids {
		if !seen[id] {
			seen[id] = true
			uniqueIds = append(uniqueIds, id)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, err
	}

	return &uniqueIds, &dto.StatusUpdate{
		UserId:         userID,
		StatusActivity: string(status),
	}, nil
}
