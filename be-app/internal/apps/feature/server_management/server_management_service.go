package servermanagement

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/apps/domain/repository"
	"be-app/internal/helper"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	DB             *gorm.DB
	ServerRepo     repository.ServerRepo
	JoinServerRepo repository.JoinServerRepo
}

func NewService(db *gorm.DB, serverRepo repository.ServerRepo, joinServerRepo repository.JoinServerRepo) *Service {
	return &Service{
		DB:             db,
		ServerRepo:     serverRepo,
		JoinServerRepo: joinServerRepo,
	}
}

func (s *Service) CreateNewServer(userID string, nameServer string, imageID string) (*entity.Server, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	pos, err := s.JoinServerRepo.GetLastPositionByUserID(tx, userID)
	if err != nil {
		return nil, err
	}

	code, err := helper.GenerateRandomString(8)
	if err != nil {
		return nil, err
	}

	joinServer := entity.JoinServer{
		ID:       uuid.NewString(),
		UserID:   userID,
		Position: pos + 1,
		IsOwner:  true,
	}

	server := entity.Server{
		ID:           uuid.NewString(),
		Name:         nameServer,
		ProfileImage: imageID,
		InviteCode:   code,
		JoinServer: []entity.JoinServer{
			joinServer,
		},
	}

	if err := s.ServerRepo.Create(tx, &server); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &server, nil
}

func (s *Service) GetServerByCode(code string) (*entity.Server, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	// data := entity.Server{}
	data := entity.Server{}
	if err := s.ServerRepo.GetListByInviteCode(tx, code, &data); err != nil {
		return nil, err
	}

	bytes, _ := json.MarshalIndent(data, "", " ")
	fmt.Println(string(bytes))

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return nil, nil
}

func (s *Service) GetListUserServer(serverID string) (*[]entity.User, error) {
	return nil, nil
}

func (s *Service) GetListChannelAndCategoryServer(serverID string) {}

func (s *Service) GetListChannelAndCategoryUser(userID string) {}
