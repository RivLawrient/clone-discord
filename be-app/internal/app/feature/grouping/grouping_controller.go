package grouping

import (
	joinserver "be-app/internal/app/domain/join_server"
	"be-app/internal/app/domain/server"
	"be-app/internal/dto"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Controller struct {
	DB             *gorm.DB
	ServerRepo     server.Repo
	JoinServerRepo joinserver.Repo
}

func NewController(db *gorm.DB, serverRepo server.Repo, joinServerRepo joinserver.Repo) Controller {
	return Controller{
		DB:             db,
		ServerRepo:     serverRepo,
		JoinServerRepo: joinServerRepo,
	}
}

func (c Controller) GenerateFiveServer(userid string) error {
	tx := c.DB.Begin()
	defer tx.Rollback()

	data := []*server.Server{
		{
			ID:   uuid.New().String(),
			Name: "AServer Alpha",
		},
		{
			ID:   uuid.New().String(),
			Name: "BServer Beta",
		},
		{
			ID:   uuid.New().String(),
			Name: "GServer Gamma",
		},
		{
			ID:   uuid.New().String(),
			Name: "DServer Delta",
		},
		{
			ID:   uuid.New().String(),
			Name: "OServer Omega",
		},
	}

	if err := c.ServerRepo.NewBatchServer(tx, data); err != nil {
		return err
	}

	var joins []*joinserver.JoinServer
	for _, s := range data {
		joins = append(joins, &joinserver.JoinServer{
			ID:       uuid.New().String(),
			UserId:   userid,
			ServerId: s.ID,
			// Position:  i, // misalnya urut 1-5
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		})
	}

	if err := c.JoinServerRepo.JoinBatchNewServer(tx, joins); err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}
	return nil
}

func (c Controller) GetJoinServer(userid string) ([]dto.ServerList, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	data := []dto.ServerList{}
	if err := c.JoinServerRepo.GetListByUserId(tx, &data, userid); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return data, nil
}
