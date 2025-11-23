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

func (s *Service) GetListChannelAndCategoryServer(serverID string) (*dto.ChannelCategory, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	var server entity.Server
	if err := s.ServerRepo.GetWithChannelAndCategory(tx, serverID, &server); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	channelList := []dto.ChannelList{}
	for _, v := range server.Channel {
		if v.ChannelCategoryID == nil {
			channelList = append(channelList, dto.ChannelList{
				ID:       v.ID,
				Name:     v.Name,
				IsVoice:  v.IsVoice,
				Position: v.Position,
			})
		}
	}

	catList := []dto.CategoryChannel{}
	for _, v := range server.ChannelCategory {
		chList := []dto.ChannelList{}
		for _, vv := range v.Channel {
			chList = append(chList, dto.ChannelList{
				ID:       vv.ID,
				Name:     vv.Name,
				IsVoice:  vv.IsVoice,
				Position: vv.Position,
			})
		}

		catList = append(catList, dto.CategoryChannel{
			ID:       v.ID,
			Name:     v.Name,
			Position: v.Position,
			Channel:  chList,
		})
	}

	return &dto.ChannelCategory{
		ServerId: server.ID,
		Channel:  channelList,
		Category: catList,
	}, nil
}

func (s *Service) GetListChannelAndCategoryUser(userID string) (*[]dto.ChannelCategory, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	var joinServer []entity.JoinServer
	s.JoinServerRepo.GetListByUserID(tx, userID, &joinServer)

	// js, _ := json.MarshalIndent(joinServer, "", " ")
	// fmt.Println(string(js))

	// var list []dto.ChannelCategory
	list := []dto.ChannelCategory{}
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
	tx := s.DB.Begin()
	defer tx.Rollback()

	joinServer := entity.JoinServer{}
	if err := s.JoinServerRepo.GetByServerIDUserID(tx, serverID, userID, &joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	channels := []entity.Channel{}
	if err := s.ChannelRepo.GetListByServerID(tx, serverID, &channels); err != nil {
		return nil, err
	}

	categories := []entity.ChannelCategory{}
	if err := s.ChannelCategoryRepo.GetListByServerID(tx, serverID, &categories); err != nil {
		return nil, err
	}

	newChannels := []entity.Channel{}
	if req.ToCategory == 0 && req.FromCategory == 0 {
		for _, v := range channels {
			if v.ChannelCategoryID == nil {
				if req.ToPosition < req.FromPosition {
					if v.Position >= req.ToPosition && v.Position < req.FromPosition {
						v.Position = v.Position + 1
						newChannels = append(newChannels, v)
						continue
					} else if v.Position == req.FromPosition {
						v.Position = req.ToPosition
						newChannels = append(newChannels, v)
						continue
					}
				}

				if req.ToPosition > req.FromPosition {
					if v.Position <= req.ToPosition && v.Position > req.FromPosition {
						v.Position = v.Position - 1
						newChannels = append(newChannels, v)
						continue
					} else if v.Position == req.FromPosition {
						v.Position = req.ToPosition
						newChannels = append(newChannels, v)
						continue
					}
				}
			}
			newChannels = append(newChannels, v)
		}
	}

	if req.ToCategory == req.FromCategory && req.ToCategory > 0 {
		for _, c := range categories {
			if c.Position == req.FromCategory {
				for _, v := range channels {
					if v.ChannelCategoryID != nil && *v.ChannelCategoryID == c.ID {
						if req.ToPosition < req.FromPosition {
							if v.Position >= req.ToPosition && v.Position < req.FromPosition {
								v.Position = v.Position + 1
								newChannels = append(newChannels, v)
								continue
							} else if v.Position == req.FromPosition {
								v.Position = req.ToPosition
								newChannels = append(newChannels, v)
								continue
							}
						}

						if req.ToPosition > req.FromPosition {
							if v.Position <= req.ToPosition && v.Position > req.FromPosition {
								v.Position = v.Position - 1
								newChannels = append(newChannels, v)
								continue
							} else if v.Position == req.FromPosition {
								v.Position = req.ToPosition
								newChannels = append(newChannels, v)
								continue
							}
						}
					}
					newChannels = append(newChannels, v)
				}
			}
		}
	}

	if req.ToCategory != req.FromCategory && req.ToCategory > 0 && req.FromCategory > 0 {
		idCategory, err := s.ChannelCategoryRepo.GetIDByPositionAndServerID(tx, serverID, req.FromCategory)
		if err != nil {
			return nil, err
		}

		//yang akan ditambahkan
		catchChannel := entity.Channel{}
		if err := s.ChannelRepo.GetByPositionAndServerIDOnCategory(tx, serverID, idCategory, req.FromPosition, &catchChannel); err != nil {
			return nil, err
		}

		for _, v := range channels {
			if v.ChannelCategoryID != nil {
				for _, c := range categories {
					if *v.ChannelCategoryID == c.ID {

						//hapus dan hitung ulang position
						if c.Position == req.FromCategory {
							if v.Position != req.FromPosition {
								if v.Position > req.FromPosition {
									v.Position = v.Position - 1
								}

								newChannels = append(newChannels, v)
								continue
							}
						}

						//re-posisi beri ruang untuk yg baru
						if c.Position == req.ToCategory {
							if req.FromCategory > req.ToCategory {
								if v.Position >= req.ToPosition {
									v.Position = v.Position + 1
								}
							} else {
								if v.Position > req.ToPosition {
									v.Position = v.Position + 1
								}
							}
							newChannels = append(newChannels, v)
							continue
						}
					}
				}
			} else {
				newChannels = append(newChannels, v)
			}

		}

		//tambah baru
		for _, c := range categories {
			if c.Position == req.ToCategory {
				catchChannel.ChannelCategoryID = &c.ID
				if req.FromCategory > req.ToCategory {
					catchChannel.Position = req.ToPosition
				} else {

					catchChannel.Position = req.ToPosition + 1
				}
				newChannels = append(newChannels, catchChannel)
			}
		}
	}

	if req.ToCategory != req.FromCategory && ((req.ToCategory == 0 && req.FromCategory != 0) || (req.ToCategory != 0 && req.FromCategory == 0)) {
		// log.Println("//antar category 0 dan 1")

		var catchChannel entity.Channel
		if req.FromCategory == 0 {
			if err := s.ChannelRepo.GetByPositionAndServerID(tx, serverID, req.FromPosition, &catchChannel); err != nil {
				return nil, err
			}

		} else {
			idCategory, err := s.ChannelCategoryRepo.GetIDByPositionAndServerID(tx, serverID, req.FromCategory)
			if err != nil {
				return nil, err
			}

			//yang akan ditambahkan
			if err := s.ChannelRepo.GetByPositionAndServerIDOnCategory(tx, serverID, idCategory, req.FromPosition, &catchChannel); err != nil {
				return nil, err
			}
		}

		//rule: kalau fromPos == 0 hapus dulu jika tidak, tambah dulu
		for _, v := range channels {
			if v.ChannelCategoryID == nil {
				if req.FromCategory == 0 {
					//hapus
					if v.Position != req.FromPosition {
						if v.Position > req.FromPosition {
							v.Position = v.Position - 1
						}
						newChannels = append(newChannels, v)
						continue
					}
				} else {
					//beri ruang
					if v.Position >= req.ToPosition {
						v.Position = v.Position + 1
					}
					newChannels = append(newChannels, v)
					continue
				}
			} else {
				for _, c := range categories {
					if *v.ChannelCategoryID == c.ID {
						if req.FromCategory == 0 {
							//beri ruang
							if c.Position == req.ToCategory {
								if v.Position > req.ToPosition {
									v.Position = v.Position + 1
								}
								newChannels = append(newChannels, v)
								continue
							} else {
								newChannels = append(newChannels, v)
							}

						}
						if req.FromCategory != 0 {
							//hapus
							if req.FromCategory == c.Position {
								if v.Position != req.FromPosition {
									if v.Position > req.FromPosition {
										v.Position = v.Position - 1
									}

									newChannels = append(newChannels, v)
									continue
								}
							} else {

								newChannels = append(newChannels, v)
							}

						}
					}

				}
			}
		}
		//sesi memindahkan

		if req.ToCategory == 0 {
			catchChannel.ChannelCategoryID = nil
			catchChannel.Position = req.ToPosition
			newChannels = append(newChannels, catchChannel)
		}
		if req.ToCategory != 0 {
			for _, c := range categories {
				if req.ToCategory == c.Position {
					catchChannel.ChannelCategoryID = &c.ID
					catchChannel.Position = req.ToPosition + 1
					newChannels = append(newChannels, catchChannel)
				}
			}
		}

		for _, v := range newChannels {
			log.Println(v)
		}
	}

	if err := s.ChannelRepo.UpdateBatch(tx, &newChannels); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	result := dto.ChannelCategory{
		ServerId: serverID,
		Channel:  []dto.ChannelList{},
		Category: []dto.CategoryChannel{},
	}

	// 1️⃣ Map category ke DTO
	for _, cat := range categories {
		catDTO := dto.CategoryChannel{
			ID:       cat.ID,
			Name:     cat.Name,
			Position: cat.Position,
			Channel:  []dto.ChannelList{},
		}

		// ambil semua channel yang punya CategoryChannelId == cat.ID
		for _, ch := range newChannels {
			if ch.ChannelCategoryID != nil && *ch.ChannelCategoryID == cat.ID {
				catDTO.Channel = append(catDTO.Channel, dto.ChannelList{
					ID:       ch.ID,
					Name:     ch.Name,
					IsVoice:  ch.IsVoice, // typo kamu ya, sebaiknya "IsVoice"
					Position: ch.Position,
				})
			}
		}

		result.Category = append(result.Category, catDTO)
	}

	// 2️⃣ Channel yang tidak punya kategori (CategoryChannelId == nil)
	for _, ch := range newChannels {
		if ch.ChannelCategoryID == nil {
			result.Channel = append(result.Channel, dto.ChannelList{
				ID:       ch.ID,
				Name:     ch.Name,
				IsVoice:  ch.IsVoice,
				Position: ch.Position,
			})
		}
	}

	return &result, nil
}

func (s *Service) Get_listUserIDInServer(serverID string) *[]string {
	data := []string{}
	s.JoinServerRepo.GetListUserIDByServerID(s.DB, serverID, &data)
	return &data
}

func (s *Service) UpdateProfile(userID string, serverID string, nameServer string, imageID string) (*entity.Server, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	joinServer := entity.JoinServer{}
	if err := s.JoinServerRepo.GetByServerIDUserID(tx, serverID, userID, &joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	server := joinServer.Server
	server.Name = nameServer
	server.ProfileImage = imageID

	if err := s.ServerRepo.Update(tx, &server); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &server, nil
}

func (s *Service) DeleteServer(userID string, serverID string) (*entity.Server, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	joinServer := entity.JoinServer{}
	if err := s.JoinServerRepo.GetByServerIDUserID(tx, serverID, userID, &joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	// joinServers := []entity.JoinServer{}
	// err := s.JoinServerRepo.GetListByUserID(tx, userID, &joinServers)
	// if err != nil {
	// 	return nil, err
	// }

	// newJoinServer := []entity.JoinServer{}
	// for _, v := range joinServers {
	// 	if v.ID != joinServer.ID {

	// 		if v.Position > joinServer.Position {
	// 			v.Position = v.Position - 1
	// 		}

	// 		newJoinServer = append(newJoinServer, v)
	// 	}
	// }

	// if err := s.JoinServerRepo.UpdateBatch(tx, &newJoinServer); err != nil {
	// 	return nil, err
	// }

	if err := s.ServerRepo.Delete(tx, &joinServer.Server); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return &joinServer.Server, nil
}

func (s *Service) GetListMemberServer(userID, serverID string) (*[]entity.UserProfile, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	check, err := s.JoinServerRepo.CheckAlreadyJoin(tx, serverID, userID)
	if err != nil {
		return nil, err
	}

	if !check {
		return nil, errs.ErrNotJoinServer
	}

	list := []entity.JoinServer{}
	if err := s.JoinServerRepo.GetListByServerID(tx, serverID, &list); err != nil {
		return nil, err
	}

	users := []entity.UserProfile{}
	for _, v := range list {
		users = append(users, v.User.UserProfile)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return &users, nil
}

func (s *Service) RenameChannel(userID, channelID, name string) (*entity.Channel, error) {
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

	channel.Name = name

	if err := s.ChannelRepo.Update(tx, &channel); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {

		return nil, err
	}

	return &channel, nil
}

func (s *Service) RenameCateogry(userID, categoryID, name string) (*entity.ChannelCategory, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	var cat entity.ChannelCategory
	if err := s.ChannelCategoryRepo.GetByID(tx, categoryID, &cat); err != nil {
		return nil, err
	}

	var joinServer entity.JoinServer
	if err := s.JoinServerRepo.GetByServerIDUserID(tx, cat.ServerID, userID, &joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	cat.Name = name

	if err := s.ChannelCategoryRepo.Update(tx, &cat); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {

		return nil, err
	}

	return &cat, nil
}
