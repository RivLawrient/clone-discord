package messagingchannel

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/apps/domain/repository"
	"be-app/internal/dto"
	"be-app/internal/errs"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	DB                  *gorm.DB
	ChannelMessageRepo  repository.ChannelMessageRepo
	UserRepo            repository.UserRepo
	UserProfileRepo     repository.UserProfileRepo
	ServerRepo          repository.ServerRepo
	JoinServerRepo      repository.JoinServerRepo
	ChannelRepo         repository.ChannelRepo
	ChannelCategoryRepo repository.ChannelCategoryRepo
}

func NewService(db *gorm.DB, userRepo repository.UserRepo, userProfileRepo repository.UserProfileRepo, channelMessageRepo repository.ChannelMessageRepo, serverRepo repository.ServerRepo, joinServerRepo repository.JoinServerRepo, channelRepo repository.ChannelRepo, channelCategoryRepo repository.ChannelCategoryRepo) *Service {
	return &Service{
		DB:                  db,
		ChannelMessageRepo:  channelMessageRepo,
		UserRepo:            userRepo,
		UserProfileRepo:     userProfileRepo,
		ServerRepo:          serverRepo,
		JoinServerRepo:      joinServerRepo,
		ChannelRepo:         channelRepo,
		ChannelCategoryRepo: channelCategoryRepo,
	}
}

func (s *Service) AddTextMsg(userID string, channelID string, text string) (*entity.ChannelMessage, *entity.UserProfile, *[]string, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	profile := entity.UserProfile{}
	if err := s.UserProfileRepo.GetByUserID(tx, userID, &profile); err != nil {
		return nil, nil, nil, err
	}

	channel := entity.Channel{}
	if err := s.ChannelRepo.GetByID(tx, channelID, &channel); err != nil {
		return nil, nil, nil, err
	}

	check, err := s.JoinServerRepo.CheckAlreadyJoin(tx, channel.ServerID, userID)
	if err != nil {
		return nil, nil, nil, err
	}

	if !check {
		return nil, nil, nil, errs.ErrNotJoinServer
	}

	joinServer := entity.JoinServer{}
	if err := s.JoinServerRepo.GetByServerIDUserID(tx, channel.ServerID, userID, &joinServer); err != nil {
		return nil, nil, nil, err
	}

	message := entity.ChannelMessage{
		ID:        uuid.NewString(),
		UserID:    userID,
		Text:      text,
		ChannelID: channel.ID,
	}

	if err := s.ChannelMessageRepo.Create(tx, &message); err != nil {
		return nil, nil, nil, err
	}

	users := []string{}
	if err := s.JoinServerRepo.GetListUserIDByServerID(tx, channel.ServerID, &users); err != nil {
		return nil, nil, nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, nil, err
	}

	return &message, &profile, &users, nil
}

func (s *Service) GetListTextMsg(userID string, channelID string, beforeID string, limit int) (*[]dto.MessageChannel, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	messages := []entity.ChannelMessage{}
	if beforeID != "" {
		message := entity.ChannelMessage{}
		if err := s.ChannelMessageRepo.GetByID(tx, beforeID, &message); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errs.ErrIDNotFound
			}
			return nil, err
		}

		if err := s.ChannelMessageRepo.GetListBeforeTimeByChannelID(tx, channelID, message.CreatedAt, beforeID, limit, &messages); err != nil {
			return nil, err
		}

	} else {
		if err := s.ChannelMessageRepo.GetListByChannelID(tx, channelID, limit, &messages); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	data := []dto.MessageChannel{}

	for _, v := range messages {
		data = append(data, dto.MessageChannel{
			ID: v.ID,
			User: dto.UserOther{
				UserId:         v.User.ID,
				Name:           v.User.UserProfile.Name,
				Username:       v.User.UserProfile.Username,
				Avatar:         v.User.UserProfile.Avatar,
				AvatarBg:       v.User.UserProfile.AvatarBg,
				StatusActivity: v.User.UserProfile.StatusActivity,
				Bio:            v.User.UserProfile.Bio,
				BannerColor:    v.User.UserProfile.BannerColor,
			},
			Text:      v.Text,
			CreatedAt: v.CreatedAt,
		})
	}

	return &data, nil
}

func (s *Service) EditTextMsg(userID, chatID, text string) (*entity.ChannelMessage, *entity.UserProfile, *[]string, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	profile := entity.UserProfile{}
	if err := s.UserProfileRepo.GetByUserID(tx, userID, &profile); err != nil {
		return nil, nil, nil, err
	}

	chat := entity.ChannelMessage{}
	if err := s.ChannelMessageRepo.GetByID(tx, chatID, &chat); err != nil {
		return nil, nil, nil, err
	}

	if chat.UserID != userID {
		return nil, nil, nil, errs.ErrNotOwnerMessage
	}

	chat.Text = text

	if err := s.ChannelMessageRepo.Update(tx, &chat); err != nil {
		return nil, nil, nil, err
	}

	users := []string{}
	if err := s.JoinServerRepo.GetListUserIDByServerID(tx, chat.Channel.ServerID, &users); err != nil {
		return nil, nil, nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, nil, err
	}
	return &chat, &profile, &users, nil
}

func (s *Service) RemoveTextMsg(userID, chatID string) (*entity.ChannelMessage, *entity.UserProfile, *[]string, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	profile := entity.UserProfile{}
	if err := s.UserProfileRepo.GetByUserID(tx, userID, &profile); err != nil {
		return nil, nil, nil, err
	}

	chat := entity.ChannelMessage{}
	if err := s.ChannelMessageRepo.GetByID(tx, chatID, &chat); err != nil {
		return nil, nil, nil, err
	}

	if chat.UserID != userID {
		return nil, nil, nil, errs.ErrNotOwnerMessage
	}
	if err := s.ChannelMessageRepo.Delete(tx, &chat); err != nil {
		return nil, nil, nil, err
	}

	users := []string{}
	if err := s.JoinServerRepo.GetListUserIDByServerID(tx, chat.Channel.ServerID, &users); err != nil {
		return nil, nil, nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, nil, err
	}

	return &chat, &profile, &users, nil
}
