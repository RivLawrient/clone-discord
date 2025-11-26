package messaginguser

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
	DB              *gorm.DB
	UserMessageRepo repository.UserMessageRepo
	UserRepo        repository.UserRepo
	UserProfileRepo repository.UserProfileRepo
}

func NewService(db *gorm.DB, userMessageRepo repository.UserMessageRepo, userRepo repository.UserRepo, userProfileRepo repository.UserProfileRepo) *Service {
	return &Service{
		DB:              db,
		UserMessageRepo: userMessageRepo,
		UserRepo:        userRepo,
		UserProfileRepo: userProfileRepo,
	}
}

func (s *Service) AddTextMsg(userID, receiverID, text string) (*entity.UserMessage, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	me := entity.User{}
	if err := s.UserRepo.FindByID(tx, userID, &me); err != nil {
		return nil, err
	}

	otherUser := entity.User{}
	if err := s.UserRepo.FindByID(tx, receiverID, &otherUser); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.ErrIDNotFound
		}
		return nil, err
	}

	dm := entity.UserMessage{
		ID:         uuid.NewString(),
		SenderID:   userID,
		ReceiverID: otherUser.ID,
		Text:       text,
		Sender:     me,
		Receiver:   otherUser,
	}

	if err := s.UserMessageRepo.Create(tx, &dm); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &dm, nil
}

func (s *Service) GetListTextMsg(userID, otherUserID string, beforeID string, limit int) (*[]dto.MessageUser, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	messages := []entity.UserMessage{}
	if beforeID != "" {
		message := entity.UserMessage{}
		if err := s.UserMessageRepo.GetByID(tx, beforeID, &message); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errs.ErrIDNotFound
			}

			return nil, err
		}
		if err := s.UserMessageRepo.GetListBeforeTimeByTwoID(tx, userID, otherUserID, message.CreatedAt, beforeID, limit, &messages); err != nil {
			return nil, err
		}

	} else {

		if err := s.UserMessageRepo.GetListByTwoID(tx, userID, otherUserID, limit, &messages); err != nil {
			return nil, err
		}

	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	data := []dto.MessageUser{}

	for _, v := range messages {
		data = append(data, dto.MessageUser{
			ID: v.ID,
			User: dto.UserOther{
				UserId:         v.Sender.ID,
				Name:           v.Sender.UserProfile.Name,
				Username:       v.Sender.UserProfile.Username,
				Avatar:         v.Sender.UserProfile.Avatar,
				AvatarBg:       v.Sender.UserProfile.AvatarBg,
				StatusActivity: v.Sender.UserProfile.StatusActivity,
				Bio:            v.Sender.UserProfile.Bio,
				BannerColor:    v.Sender.UserProfile.BannerColor,
			},
			Text:      v.Text,
			CreatedAt: v.CreatedAt,
		})

	}
	return &data, nil
}

func (s *Service) EditTextMsg(userID, chatID, text string) (*dto.MessageUser, *string, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	msg := entity.UserMessage{}
	if err := s.UserMessageRepo.GetByID(tx, chatID, &msg); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, errs.ErrIDNotFound
		}
		return nil, nil, err
	}

	if msg.SenderID != userID {
		return nil, nil, errs.ErrNotOwnerMessage
	}

	msg.Text = text

	if err := s.UserMessageRepo.Update(tx, &msg); err != nil {
		return nil, nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, err
	}

	return &dto.MessageUser{
		ID: msg.ID,
		User: dto.UserOther{
			UserId:         msg.Sender.ID,
			Name:           msg.Sender.UserProfile.Name,
			Username:       msg.Sender.UserProfile.Username,
			Avatar:         msg.Sender.UserProfile.Avatar,
			AvatarBg:       msg.Sender.UserProfile.AvatarBg,
			StatusActivity: msg.Sender.UserProfile.StatusActivity,
			Bio:            msg.Sender.UserProfile.Bio,
			BannerColor:    msg.Sender.UserProfile.BannerColor,
		},
		Text:      msg.Text,
		CreatedAt: msg.CreatedAt,
	}, &msg.ReceiverID, nil
}

func (s *Service) RemoveTextMsg(userID, chatID string) (*entity.UserMessage, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	msg := entity.UserMessage{}
	if err := s.UserMessageRepo.GetByID(tx, chatID, &msg); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.ErrIDNotFound
		}
		return nil, err
	}

	if msg.SenderID != userID {
		return nil, errs.ErrNotOwnerMessage
	}

	if err := s.UserMessageRepo.Remove(tx, &msg); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &msg, nil
}

func (s *Service) ListDM(userID string) (*[]entity.UserProfile, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	listuSer := []string{}
	if err := s.UserMessageRepo.GetListOtherUserID(tx, userID, &listuSer); err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errs.ErrIDNotFound
		}
		return nil, err
	}

	list := []entity.UserProfile{}
	if err := s.UserProfileRepo.GetByListUserID(tx, listuSer, &list); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &list, nil
}
