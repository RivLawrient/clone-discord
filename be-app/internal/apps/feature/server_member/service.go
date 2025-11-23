package servermember

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/apps/domain/repository"
	"be-app/internal/errs"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	DB             *gorm.DB
	JoinServerRepo repository.JoinServerRepo
	ServerRepo     repository.ServerRepo
	UserProfile    repository.UserProfileRepo
}

func NewService(db *gorm.DB, joinServerRepo repository.JoinServerRepo, serverRepo repository.ServerRepo, userProfile repository.UserProfileRepo) *Service {
	return &Service{
		DB:             db,
		JoinServerRepo: joinServerRepo,
		ServerRepo:     serverRepo,
		UserProfile:    userProfile,
	}
}

func (s *Service) GetListServer(userID string) (*[]entity.JoinServer, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	list := []entity.JoinServer{}
	if err := s.JoinServerRepo.GetListByUserIDWithJoin(tx, userID, &list); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &list, nil
}

func (s *Service) UpdateServerPosition(userID string, serverID string, newPosition int) ([]entity.JoinServer, error) {

	tx := s.DB.Begin()
	defer tx.Rollback()

	list := []entity.JoinServer{}
	if err := s.JoinServerRepo.GetListByUserIDWithJoin(tx, userID, &list); err != nil {
		return nil, err
	}

	var target entity.JoinServer
	for _, v := range list {
		if v.ServerID == serverID {
			target = v
		}
	}

	var newList []entity.JoinServer
	for _, v := range list {
		if v.Position == target.Position {
			continue
		}

		if newPosition > target.Position {
			if v.Position > target.Position && v.Position <= newPosition {
				v.Position--
			}
		}

		if newPosition < target.Position {
			if v.Position >= newPosition && v.Position < target.Position {
				v.Position++
			}
		}

		newList = append(newList, v)
	}

	target.Position = newPosition
	newList = append(newList, target)
	if err := s.JoinServerRepo.UpdateBatch(tx, &newList); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return newList, nil
}

func (s *Service) JoinServer(userID string, serverID string) (*entity.JoinServer, *[]string, *entity.UserProfile, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	profile := entity.UserProfile{}
	if err := s.UserProfile.GetByUserID(tx, userID, &profile); err != nil {
		return nil, nil, nil, err
	}

	server := entity.Server{}
	if err := s.ServerRepo.GetByID(tx, serverID, &server); err != nil {
		return nil, nil, nil, err
	}

	check, err := s.JoinServerRepo.CheckAlreadyJoin(tx, serverID, userID)
	if err != nil {
		return nil, nil, nil, err
	}

	if check {
		return &entity.JoinServer{
			ServerID: server.ID,
		}, nil, nil, errs.ErrAlreadyJoinServer
	}

	pos, err := s.JoinServerRepo.GetLastPositionByUserID(tx, userID)
	if err != nil {
		return nil, nil, nil, err
	}

	join := entity.JoinServer{
		ID:       uuid.NewString(),
		UserID:   userID,
		ServerID: serverID,
		Position: pos + 11,
		Server:   server,
	}

	if err := s.JoinServerRepo.Create(tx, &join); err != nil {
		return nil, nil, nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, nil, err
	}

	ids := []string{}
	for _, v := range server.JoinServer {
		ids = append(ids, v.UserID)
	}

	return &join, &ids, &profile, nil
}

func (s *Service) LeaveServer(userID string, serverID string) (*entity.JoinServer, *[]string, *entity.UserProfile, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	profile := entity.UserProfile{}
	if err := s.UserProfile.GetByUserID(tx, userID, &profile); err != nil {
		return nil, nil, nil, err
	}

	joinServer := entity.JoinServer{}
	if err := s.JoinServerRepo.GetByServerIDUserID(tx, serverID, userID, &joinServer); err != nil {
		return nil, nil, nil, err
	}

	if joinServer.IsOwner {
		return nil, nil, nil, errs.ErrInternal
	}

	if err := s.JoinServerRepo.Delete(tx, &joinServer); err != nil {
		return nil, nil, nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, nil, err
	}

	ids := []string{}
	for _, v := range joinServer.Server.JoinServer {
		ids = append(ids, v.UserID)
	}
	return &joinServer, &ids, &profile, nil
}
