package servermanagement

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/apps/domain/repository"
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"log"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	DB                  *gorm.DB
	ServerRepo          repository.ServerRepo
	JoinServerRepo      repository.JoinServerRepo
	ChannelRepo         repository.ChannelRepo
	ChannelCategoryRepo repository.ChannelCategoryRepo
}

func NewService(db *gorm.DB, serverRepo repository.ServerRepo, joinServerRepo repository.JoinServerRepo, channelRepo repository.ChannelRepo, channelCategoryRepo repository.ChannelCategoryRepo) *Service {
	return &Service{
		DB:                  db,
		ServerRepo:          serverRepo,
		JoinServerRepo:      joinServerRepo,
		ChannelRepo:         channelRepo,
		ChannelCategoryRepo: channelCategoryRepo,
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

	data := entity.Server{}
	if err := s.ServerRepo.GetListByInviteCode(tx, code, &data); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return &data, nil
}
func (s *Service) CreateCategoryChannel(userID string, serverID string, name string) (*entity.ChannelCategory, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	var joinServer entity.JoinServer
	if err := s.JoinServerRepo.GetByServerIDUserID(tx, serverID, userID, &joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	pos, err := s.ChannelCategoryRepo.GetLastPostitionByServerID(tx, serverID)
	if err != nil {
		return nil, err
	}

	newCategoy := entity.ChannelCategory{
		ID:       uuid.NewString(),
		ServerID: joinServer.ServerID,
		Name:     name,
		Position: pos + 1,
	}

	if err := s.ChannelCategoryRepo.Create(tx, &newCategoy); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &newCategoy, nil
}

func (s *Service) DeleteCategoryChannel(userID string, categoryID string) (*entity.ChannelCategory, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	var channelCat entity.ChannelCategory
	if err := s.ChannelCategoryRepo.GetByID(tx, categoryID, &channelCat); err != nil {
		return nil, err
	}

	var joinServer entity.JoinServer
	if err := s.JoinServerRepo.GetByServerIDUserID(tx, channelCat.ServerID, userID, &joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	var categories []entity.ChannelCategory
	if err := s.ChannelCategoryRepo.GetListByServerID(tx, channelCat.ServerID, &categories); err != nil {
		return nil, err
	}

	var newCategories []entity.ChannelCategory
	for _, v := range categories {
		if v.ID != categoryID {
			if v.Position > channelCat.Position {
				v.Position = v.Position - 1
			}
			newCategories = append(newCategories, v)
		}
	}

	if err := s.ChannelCategoryRepo.UpdateBatch(tx, &newCategories); err != nil {
		log.Println(err)
		return nil, err
	}

	if err := s.ChannelCategoryRepo.RemoveByID(tx, categoryID); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &channelCat, nil
}

func (s *Service) CreateChannel(userID string, serverID string, categoryID *string, name string, isVoice bool) (*entity.Channel, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	var joinServer entity.JoinServer
	if err := s.JoinServerRepo.GetByServerIDUserID(tx, serverID, userID, &joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	pos, err := s.ChannelRepo.GetLastPostitionByServerID(tx, serverID, categoryID)
	if err != nil {
		return nil, err
	}

	newChannel := entity.Channel{
		ID:                uuid.NewString(),
		ServerID:          serverID,
		ChannelCategoryID: categoryID,
		Name:              name,
		Position:          pos + 1,
		IsVoice:           isVoice,
	}

	if err := s.ChannelRepo.Create(tx, &newChannel); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &newChannel, nil
}

func (s *Service) DeleteChannel(userID string, channelID string, categoryID *string) (*entity.Channel, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	var channel entity.Channel
	if err := s.ChannelRepo.GetByID(tx, channelID, &channel); err != nil {
		return nil, err
	}

	var joinServer entity.JoinServer
	if err := s.JoinServerRepo.GetByServerIDUserID(tx, channel.ServerID, userID, &joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	var channels []entity.Channel
	if categoryID != nil {
		if err := s.ChannelRepo.GetListByServerIdWithCategory(tx, channel.ServerID, *categoryID, &channels); err != nil {
			return nil, err
		}
	} else {
		if err := s.ChannelRepo.GetListByServerIdWithoutCategory(tx, channel.ServerID, &channels); err != nil {
			return nil, err
		}
	}

	var newChannels []entity.Channel
	for _, v := range channels {
		if v.Position > channel.Position {
			v.Position = v.Position - 1
		}

		newChannels = append(newChannels, v)
	}

	if err := s.ChannelRepo.UpdateBatch(tx, &newChannels); err != nil {
		return nil, err
	}

	if err := s.ChannelRepo.RemoveByID(tx, channel.ID); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &channel, nil
}

func (s *Service) GetListChannelAndCategoryServer(serverID string) (*entity.Server, *[]entity.Channel, *[]entity.ChannelCategory, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	var server entity.Server
	if err := s.ServerRepo.GetWithChannelAndCategory(tx, serverID, &server); err != nil {
		return nil, nil, nil, err
	}

	// js, _ := json.MarshalIndent(server, "", " ")
	// fmt.Println(string(js))

	if err := tx.Commit().Error; err != nil {
		return nil, nil, nil, err
	}

	return &entity.Server{
		ID:           serverID,
		Name:         server.Name,
		ProfileImage: server.ProfileImage,
		InviteCode:   server.InviteCode,
	}, &server.Channel, &server.ChannelCategory, nil
}

func (s *Service) GetListChannelAndCategoryUser(userID string) (*[]dto.ChannelCategory, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	var joinServer []entity.JoinServer
	s.JoinServerRepo.GetListByUserID(tx, userID, &joinServer)

	// js, _ := json.MarshalIndent(joinServer, "", " ")
	// fmt.Println(string(js))

	var list []dto.ChannelCategory
	for _, v := range joinServer {

		channels := []dto.ChannelList{}
		for _, vv := range v.Server.Channel {
			if vv.ChannelCategoryID == nil {
				channels = append(channels, dto.ChannelList{
					ID:       vv.ID,
					Name:     vv.Name,
					IsVoice:  vv.IsVoice,
					Position: vv.Position,
				})
			}
		}

		categories := []dto.CategoryChannel{}
		for _, vv := range v.Server.ChannelCategory {
			chList := []dto.ChannelList{}
			for _, vvv := range vv.Channel {
				chList = append(chList, dto.ChannelList{
					ID:       vvv.ID,
					Name:     vvv.Name,
					IsVoice:  vvv.IsVoice,
					Position: vvv.Position,
				})
			}

			categories = append(categories, dto.CategoryChannel{
				ID:       vv.ID,
				Name:     vv.Name,
				Position: vv.Position,
				Channel:  chList,
			})
		}

		list = append(list, dto.ChannelCategory{
			ServerId: v.ServerID,
			Channel:  channels,
			Category: categories,
		})

	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &list, nil
}

func (s *Service) ReorderChannel(userID string, serverID string, req dto.ReorderChannelRequest) (*dto.ChannelCategory, error) {
	
	return nil, nil
}
