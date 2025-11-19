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
}

func NewService(db *gorm.DB, joinServerRepo repository.JoinServerRepo, serverRepo repository.ServerRepo) *Service {
	return &Service{
		DB:             db,
		JoinServerRepo: joinServerRepo,
		ServerRepo:     serverRepo,
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
			v.Position = newPosition
		}

		if newPosition > target.Position {
			if v.Position < newPosition && v.Position > target.Position {
				v.Position--
			}
		}
		if newPosition < target.Position {
			if v.Position < newPosition && v.Position > target.Position {
				v.Position++
			}
		}

		newList = append(newList, v)
	}

	if err := s.JoinServerRepo.UpdateBatch(tx, &newList); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return newList, nil
}

func (s *Service) JoinServer(userID string, serverID string) (*entity.JoinServer, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	server := entity.Server{}
	if err := s.ServerRepo.GetByID(tx, serverID, &server); err != nil {
		return nil, err
	}

	check, err := s.JoinServerRepo.CheckAlreadyJoin(tx, serverID, userID)
	if err != nil {
		return nil, err
	}

	if check {
		return nil, errs.ErrAlreadyJoinServer
	}

	pos, err := s.JoinServerRepo.GetLastPositionByUserID(tx, userID)
	if err != nil {
		return nil, err
	}

	join := entity.JoinServer{
		ID:       uuid.NewString(),
		UserID:   userID,
		ServerID: serverID,
		Position: pos + 11,
		Server:   server,
	}

	if err := s.JoinServerRepo.Create(tx, &join); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return &join, nil
}
