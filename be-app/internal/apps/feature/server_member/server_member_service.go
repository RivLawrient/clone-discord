package servermember

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/apps/domain/repository"

	"gorm.io/gorm"
)

type Service struct {
	DB             *gorm.DB
	JoinServerRepo repository.JoinServerRepo
}

func NewService(db *gorm.DB, joinServerRepo repository.JoinServerRepo) *Service {
	return &Service{
		DB:             db,
		JoinServerRepo: joinServerRepo,
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
