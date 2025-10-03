package grouping

import (
	joinserver "be-app/internal/app/domain/join_server"
	"be-app/internal/app/domain/server"
	"be-app/internal/dto"
	"fmt"
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

// make new server & save to your join_server
func (c Controller) CreateServer(userId string, nameServer string, imageId string) (*dto.ServerList, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	data := server.Server{
		ID:           uuid.NewString(),
		Name:         nameServer,
		ProfileImage: imageId,
	}

	if err := c.ServerRepo.NewServer(tx, &data); err != nil {
		return nil, err
	}

	dataJoin := joinserver.JoinServer{
		ID:       uuid.NewString(),
		UserId:   userId,
		ServerId: data.ID,
		// Position: ,
	}
	if err := c.JoinServerRepo.JoinNewServer(tx, &dataJoin); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &dto.ServerList{
		ID:           data.ID,
		Name:         data.Name,
		ProfileImage: data.ProfileImage,
		Position:     dataJoin.Position,
	}, nil
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

func (c Controller) UpdateJoinServerPosition(userId, joinServerId string, newPos int) ([]dto.ServerList, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	// Ambil semua join server milik user
	var joins []joinserver.JoinServer
	if err := tx.Where("user_id = ?", userId).
		Order("position ASC").
		Find(&joins).Error; err != nil {
		return nil, err
	}

	// Cari target join server
	var target *joinserver.JoinServer
	for i := range joins {
		if joins[i].ServerId == joinServerId {
			target = &joins[i]
			break
		}
	}
	if target == nil {
		return nil, fmt.Errorf("join server not found")
	}

	// Validasi posisi baru
	if newPos < 1 {
		newPos = 1
	}
	if newPos > len(joins) {
		newPos = len(joins)
	}

	oldPos := target.Position
	if oldPos == newPos {
		// langsung return list
		var data []dto.ServerList
		if err := c.JoinServerRepo.GetListByUserId(tx, &data, userId); err != nil {
			return nil, err
		}
		return data, nil
	}

	// Geser posisi
	for i := range joins {
		if joins[i].ID == target.ID {
			continue
		}

		if oldPos < newPos {
			// contoh: dari 2 → 5
			if joins[i].Position > oldPos && joins[i].Position <= newPos {
				joins[i].Position--
			}
		} else {
			// contoh: dari 5 → 2
			if joins[i].Position >= newPos && joins[i].Position < oldPos {
				joins[i].Position++
			}
		}
	}

	target.Position = newPos

	// Update DB
	for _, j := range joins {
		if err := tx.Model(&joinserver.JoinServer{}).
			Where("id = ?", j.ID).
			Update("position", j.Position).Error; err != nil {
			return nil, err
		}
	}
	if err := tx.Model(&joinserver.JoinServer{}).
		Where("id = ?", target.ID).
		Update("position", target.Position).Error; err != nil {
		return nil, err
	}

	// Ambil data terbaru untuk return
	var data []dto.ServerList
	if err := c.JoinServerRepo.GetListByUserId(tx, &data, userId); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return data, nil
}
