package grouping

import (
	categorychannel "be-app/internal/app/domain/category_channel"
	"be-app/internal/app/domain/channel"
	joinserver "be-app/internal/app/domain/join_server"
	"be-app/internal/app/domain/server"
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"fmt"
	"log"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Controller struct {
	DB                  *gorm.DB
	ServerRepo          server.Repo
	JoinServerRepo      joinserver.Repo
	CategoryChannelRepo categorychannel.Repo
	ChannelRepo         channel.Repo
}

func NewController(db *gorm.DB, serverRepo server.Repo, joinServerRepo joinserver.Repo, categoryChannelRepo categorychannel.Repo, channelRepo channel.Repo) Controller {
	return Controller{
		DB:                  db,
		ServerRepo:          serverRepo,
		JoinServerRepo:      joinServerRepo,
		CategoryChannelRepo: categoryChannelRepo,
		ChannelRepo:         channelRepo,
	}
}

// make new server & save to your join_server
func (c Controller) CreateServer(userId string, nameServer string, imageId string) (*dto.ServerList, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	code, _ := helper.GenerateRandomString(8)

	data := server.Server{
		ID:           uuid.NewString(),
		Name:         nameServer,
		ProfileImage: imageId,
		InviteCode:   code,
	}

	if err := c.ServerRepo.NewServer(tx, &data); err != nil {
		return nil, err
	}

	pos, errs := c.JoinServerRepo.GetLastPositionByUserID(tx, userId)
	if errs != nil {
		return nil, errs
	}

	dataJoin := joinserver.JoinServer{
		ID:       uuid.NewString(),
		UserId:   userId,
		ServerId: data.ID,
		Position: pos + 1,
		IsOwner:  true,
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
		InviteCode:   data.InviteCode,
		Position:     dataJoin.Position,
		IsOwner:      dataJoin.IsOwner,
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

func (c Controller) GetServerByCode(user_id string, code string) (*dto.ServerInvite, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	data := dto.ServerInvite{}

	if err := c.ServerRepo.ServerInviteByCode(tx, code, &data); err != nil {
		return nil, err
	}

	status, err := c.JoinServerRepo.GetAlreadyJoin(tx, user_id, data.ID)
	if err != nil {
		return nil, err
	}

	if status {
		return &data, errs.ErrAlreadyJoinServer
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &data, nil
}

func (c Controller) JoinServer(user_id string, server_id string) (*dto.ServerList, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	data := server.Server{}
	if err := c.ServerRepo.GetById(tx, server_id, &data); err != nil {
		return nil, err
	}

	status, err := c.JoinServerRepo.GetAlreadyJoin(tx, user_id, server_id)
	if err != nil {
		return nil, err
	}

	if status {
		return nil, errs.ErrAlreadyJoinServer
	}

	pos, errs := c.JoinServerRepo.GetLastPositionByUserID(tx, user_id)
	if errs != nil {
		return nil, errs
	}

	dataJoin := joinserver.JoinServer{
		ID:       uuid.NewString(),
		UserId:   user_id,
		ServerId: server_id,
		Position: pos + 1,
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
		InviteCode:   data.InviteCode,
		Position:     dataJoin.Position,
	}, nil
}

func (c Controller) CreateCategoryChannel(userId string, serverId string, name string) (*categorychannel.CategoryChannel, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	joinServer := new(joinserver.JoinServer)
	if err := c.JoinServerRepo.GetById(tx, serverId, userId, joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	lastPos, err := c.CategoryChannelRepo.GetLastPostitionByServerId(tx, joinServer.ServerId)
	if err != nil {
		return nil, err
	}

	newCategory := categorychannel.CategoryChannel{
		ID:       uuid.NewString(),
		ServerId: joinServer.ServerId,
		Name:     name,
		Position: lastPos + 1,
	}

	if err := c.CategoryChannelRepo.NewCategory(tx, &newCategory); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &categorychannel.CategoryChannel{
		ID:        newCategory.ID,
		ServerId:  newCategory.ServerId,
		Name:      newCategory.Name,
		Position:  newCategory.Position,
		CreatedAt: newCategory.CreatedAt,
		UpdatedAt: newCategory.UpdatedAt,
	}, nil
}

// harus hitung ulang position
func (c Controller) DeleteCategoryChannel(userId string, categoryId string) (*categorychannel.CategoryChannel, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	categoryChannel := new(categorychannel.CategoryChannel)
	if err := c.CategoryChannelRepo.GetById(tx, categoryId, categoryChannel); err != nil {
		return nil, err
	}

	joinServer := new(joinserver.JoinServer)
	if err := c.JoinServerRepo.GetById(tx, categoryChannel.ServerId, userId, joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	if err := c.CategoryChannelRepo.RemoveById(tx, categoryId); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return categoryChannel, nil
}

func (c Controller) CreateChannel(userId string, serverId string, name string, isVoice bool, categoryId *string) (*channel.Channel, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	joinServer := new(joinserver.JoinServer)
	if err := c.JoinServerRepo.GetById(tx, serverId, userId, joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	lastPost, err := c.ChannelRepo.GetLastPostitionByServerId(tx, serverId, categoryId)
	if err != nil {
		return nil, err
	}

	newChannel := channel.Channel{
		ID:                uuid.NewString(),
		ServerId:          serverId,
		CategoryChannelId: categoryId,
		Name:              name,
		Position:          lastPost + 1,
		IsVoice:           isVoice,
	}

	if err := c.ChannelRepo.NewServer(tx, &newChannel); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &newChannel, nil
}

// harus hitung ulang position
func (c Controller) DeleteChannel(userId string, channelId string, categoryId *string) (*channel.Channel, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	ch := new(channel.Channel)
	if err := c.ChannelRepo.GetById(tx, channelId, ch); err != nil {
		return nil, err
	}

	joinServer := new(joinserver.JoinServer)
	if err := c.JoinServerRepo.GetById(tx, ch.ServerId, userId, joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	channels := new([]channel.Channel)
	if categoryId != nil {
		if err := c.ChannelRepo.GetListByServerIdWithCategory(tx, ch.ServerId, *ch.CategoryChannelId, channels); err != nil {
			return nil, err
		}
	} else {
		if err := c.ChannelRepo.GetListByServerIdWithoutCategory(tx, ch.ServerId, channels); err != nil {
			return nil, err
		}
	}

	newChannels := []channel.Channel{}
	for _, c := range *channels {
		if c.Position > ch.Position {
			c.Position = c.Position - 1
		}
		newChannels = append(newChannels, c)
	}

	for _, c := range newChannels {
		log.Println(c)
	}

	if err := c.ChannelRepo.UpdateBatch(tx, newChannels); err != nil {
		return nil, err
	}

	if err := c.ChannelRepo.RemoveById(tx, channelId); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return ch, nil

}

func (c Controller) ListUserOnServer(serverId string) (*[]string, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	var listId []string
	if err := c.JoinServerRepo.GetListUserIdByServerId(tx, serverId, &listId); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &listId, nil

}

func (c Controller) GetChannelAndCategory(serverId string) (*dto.ChannelCategory, error) {
	tx := c.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	defer tx.Rollback()

	// Ambil semua channel
	var channels []channel.Channel
	if err := c.ChannelRepo.GetListByServerId(tx, serverId, &channels); err != nil {
		return nil, err
	}

	// Ambil semua category
	var categories []categorychannel.CategoryChannel
	if err := c.CategoryChannelRepo.GetListByServerId(tx, serverId, &categories); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Siapkan hasil
	result := dto.ChannelCategory{
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
		for _, ch := range channels {
			if ch.CategoryChannelId != nil && *ch.CategoryChannelId == cat.ID {
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
	for _, ch := range channels {
		if ch.CategoryChannelId == nil {
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

func (c Controller) ReorderChannel(userId string, serverId string, req dto.ReorderChannelRequest) (*dto.ChannelCategory, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	joinServer := new(joinserver.JoinServer)
	if err := c.JoinServerRepo.GetById(tx, serverId, userId, joinServer); err != nil {
		return nil, err
	}

	if !joinServer.IsOwner {
		return nil, errs.ErrNotOwnerServer
	}

	// Ambil semua channel
	var channels []channel.Channel
	if err := c.ChannelRepo.GetListByServerId(tx, serverId, &channels); err != nil {
		return nil, err
	}

	// Ambil semua category
	var categories []categorychannel.CategoryChannel
	if err := c.CategoryChannelRepo.GetListByServerId(tx, serverId, &categories); err != nil {
		return nil, err
	}

	newChannels := []channel.Channel{}
	if req.ToCategory == 0 && req.FromCategory == 0 {
		// log.Println("// antar category 0")

		for _, v := range channels {
			if v.CategoryChannelId == nil {
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
		if err := c.ChannelRepo.ReorderPositionBatch(tx, serverId, &newChannels); err != nil {
			return nil, err
		}
	}

	if req.ToCategory == req.FromCategory && req.ToCategory > 0 {
		// log.Println("// antar category bukan 0 yang sama")

		for _, c := range categories {
			if c.Position == req.FromCategory {
				for _, v := range channels {
					if v.CategoryChannelId != nil && *v.CategoryChannelId == c.ID {
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
		if err := c.ChannelRepo.ReorderPositionBatch(tx, serverId, &newChannels); err != nil {
			return nil, err
		}
	}

	if req.ToCategory != req.FromCategory && req.ToCategory > 0 && req.FromCategory > 0 {
		// log.Println("// antar category bukan 0 yang beda")

		idCategory, err := c.CategoryChannelRepo.GetIdByPositionAndServerId(tx, serverId, req.FromCategory)
		if err != nil {
			return nil, err
		}

		//yang akan ditambahkan
		catchChannel := channel.Channel{}
		if err := c.ChannelRepo.GetByPositionAndServerIdOnCategory(tx, serverId, idCategory, req.FromPosition, &catchChannel); err != nil {
			return nil, err
		}

		for _, v := range channels {
			if v.CategoryChannelId != nil {
				for _, c := range categories {
					if *v.CategoryChannelId == c.ID {

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
				catchChannel.CategoryChannelId = &c.ID
				if req.FromCategory > req.ToCategory {
					catchChannel.Position = req.ToPosition
				} else {

					catchChannel.Position = req.ToPosition + 1
				}
				newChannels = append(newChannels, catchChannel)
			}
		}

		//query
		if err := c.ChannelRepo.UpdateBatch(tx, newChannels); err != nil {
			return nil, err
		}

	}

	if req.ToCategory != req.FromCategory && ((req.ToCategory == 0 && req.FromCategory != 0) || (req.ToCategory != 0 && req.FromCategory == 0)) {
		// log.Println("//antar category 0 dan 1")

		var catchChannel channel.Channel
		if req.FromCategory == 0 {
			if err := c.ChannelRepo.GetByPositionAndServerId(tx, serverId, req.FromPosition, &catchChannel); err != nil {
				return nil, err
			}

		} else {
			idCategory, err := c.CategoryChannelRepo.GetIdByPositionAndServerId(tx, serverId, req.FromCategory)
			if err != nil {
				return nil, err
			}

			//yang akan ditambahkan
			if err := c.ChannelRepo.GetByPositionAndServerIdOnCategory(tx, serverId, idCategory, req.FromPosition, &catchChannel); err != nil {
				return nil, err
			}
		}

		//rule: kalau fromPos == 0 hapus dulu jika tidak, tambah dulu
		for _, v := range channels {
			if v.CategoryChannelId == nil {
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
					if *v.CategoryChannelId == c.ID {
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
			catchChannel.CategoryChannelId = nil
			catchChannel.Position = req.ToPosition
			newChannels = append(newChannels, catchChannel)
		}
		if req.ToCategory != 0 {
			for _, c := range categories {
				if req.ToCategory == c.Position {
					catchChannel.CategoryChannelId = &c.ID
					catchChannel.Position = req.ToPosition + 1
					newChannels = append(newChannels, catchChannel)
				}
			}
		}

		for _, v := range newChannels {
			log.Println(v)
		}
		//query
		if err := c.ChannelRepo.UpdateBatch(tx, newChannels); err != nil {
			return nil, err
		}
	}

	//query

	result := dto.ChannelCategory{
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
			if ch.CategoryChannelId != nil && *ch.CategoryChannelId == cat.ID {
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
		if ch.CategoryChannelId == nil {
			result.Channel = append(result.Channel, dto.ChannelList{
				ID:       ch.ID,
				Name:     ch.Name,
				IsVoice:  ch.IsVoice,
				Position: ch.Position,
			})
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return &result, nil
	// return nil, nil
}
