package channelmessaging

import (
	"be-app/internal/app/domain/channel"
	joinserver "be-app/internal/app/domain/join_server"
	messagechannel "be-app/internal/app/domain/message_channel"
	userprofile "be-app/internal/app/domain/user_profile"
	"be-app/internal/dto"
	"be-app/internal/errs"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Controller struct {
	DB                 *gorm.DB
	MessageChannelRepo messagechannel.Repo
	JoinServerRepo     joinserver.Repo
	ChannelRepo        channel.Repo
	UserProfileRepo    userprofile.Repo
}

func NewController(
	db *gorm.DB,
	msgChannelRepo messagechannel.Repo,
	joinServerRepo joinserver.Repo,
	channelRepo channel.Repo,
	userProfileRepo userprofile.Repo,
) Controller {
	return Controller{
		DB:                 db,
		MessageChannelRepo: msgChannelRepo,
		JoinServerRepo:     joinServerRepo,
		ChannelRepo:        channelRepo,
		UserProfileRepo:    userProfileRepo,
	}
}

func (c Controller) AddTextMsgToChannel(userId string, channelId string, text string) (*messagechannel.MessageChannel, *userprofile.UserProfile, *[]string, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	profile := new(userprofile.UserProfile)
	if err := c.UserProfileRepo.GetByUserId(tx, userId, profile); err != nil {
		return nil, nil, nil, nil
	}

	ch := new(channel.Channel)
	if err := c.ChannelRepo.GetById(tx, channelId, ch); err != nil {
		return nil, nil, nil, err
	}

	check, err := c.JoinServerRepo.GetAlreadyJoin(tx, userId, ch.ServerId)
	if err != nil {
		return nil, nil, nil, err
	}

	if !check {
		return nil, nil, nil, errs.ErrNotJoinServer
	}

	joinServer := new(joinserver.JoinServer)
	if err := c.JoinServerRepo.GetById(tx, ch.ServerId, userId, joinServer); err != nil {
		return nil, nil, nil, err
	}

	message := messagechannel.MessageChannel{
		ID:        uuid.NewString(),
		UserId:    userId,
		Text:      text,
		ChannelId: channelId,
	}

	if err := c.MessageChannelRepo.NewChat(tx, &message); err != nil {
		return nil, nil, nil, err
	}

	var userList []string
	if err := c.JoinServerRepo.GetListUserIdByServerId(tx, ch.ServerId, &userList); err != nil {
		return nil, nil, nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, nil, err
	}

	return &message, profile, &userList, nil
}

// func (c Controller) ListTextMsgByChannel(channelId string) (*[]dto.MessageChannel, error) {
// 	tx := c.DB.Begin()
// 	defer tx.Rollback()

// 	list := new([]messagechannel.MessageChannel)
// 	if err := c.MessageChannelRepo.ListByChannelId(tx, channelId, list); err != nil {
// 		return nil, err
// 	}

// 	var listId []string

// 	for _, v := range *list {
// 		listId = append(listId, v.UserId)
// 	}

// 	listProfile := new([]userprofile.UserProfile)
// 	if err := c.UserProfileRepo.GetListByListUserId(tx, listId, listProfile); err != nil {
// 		return nil, err
// 	}

// 	result := []dto.MessageChannel{}

// 	for _, v := range *list {
// 		for _, vv := range *listProfile {
// 			if v.UserId == vv.UserId {
// 				result = append(result, dto.MessageChannel{
// 					ID: v.ID,
// 					User: dto.UserOther{
// 						UserId:         vv.UserId,
// 						Name:           vv.Name,
// 						Username:       vv.Username,
// 						Avatar:         vv.Avatar,
// 						AvatarBg:       vv.AvatarBg,
// 						StatusActivity: vv.StatusActivity,
// 						Bio:            vv.Bio,
// 						BannerColor:    vv.BannerColor,
// 					},
// 					Text:      v.Text,
// 					CreatedAt: v.CreatedAt,
// 				})
// 			}
// 		}
// 	}

// 	if err := tx.Commit().Error; err != nil {
// 		return nil, err
// 	}
// 	return &result, nil
// }

func (c Controller) ListTextMsgByChannel(channelId string) (*[]dto.MessageChannel, error) {
	tx := c.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// --- 1️⃣ Ambil daftar pesan berdasarkan channel ---
	list := new([]messagechannel.MessageChannel)
	if err := c.MessageChannelRepo.ListByChannelId(tx, channelId, list); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to get messages: %w", err)
	}

	if len(*list) == 0 {
		tx.Commit()
		return &[]dto.MessageChannel{}, nil
	}

	// --- 2️⃣ Kumpulkan user_id unik ---
	seen := make(map[string]bool)
	listId := make([]string, 0)

	for _, msg := range *list {
		if !seen[msg.UserId] {
			seen[msg.UserId] = true
			listId = append(listId, msg.UserId)
		}
	}

	// --- 3️⃣ Ambil profil user berdasarkan user_id unik ---
	listProfile := new([]userprofile.UserProfile)
	if err := c.UserProfileRepo.GetListByListUserId(tx, listId, listProfile); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to get user profiles: %w", err)
	}

	// --- 4️⃣ Buat map user_id -> profile untuk akses cepat ---
	profileMap := make(map[string]userprofile.UserProfile, len(*listProfile))
	for _, p := range *listProfile {
		profileMap[p.UserId] = p
	}

	// --- 5️⃣ Gabungkan pesan dengan profil user ---
	result := make([]dto.MessageChannel, 0, len(*list))

	for _, msg := range *list {
		if profile, ok := profileMap[msg.UserId]; ok {
			result = append(result, dto.MessageChannel{
				ID: msg.ID,
				User: dto.UserOther{
					UserId:         profile.UserId,
					Name:           profile.Name,
					Username:       profile.Username,
					Avatar:         profile.Avatar,
					AvatarBg:       profile.AvatarBg,
					StatusActivity: profile.StatusActivity,
					Bio:            profile.Bio,
					BannerColor:    profile.BannerColor,
				},
				Text:      msg.Text,
				CreatedAt: msg.CreatedAt,
			})
		}
	}

	// --- 6️⃣ Commit transaksi ---
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &result, nil
}
