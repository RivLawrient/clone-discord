package chatting

import (
	textchatuser "be-app/internal/app/domain/text_chat_user"
	"be-app/internal/dto"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Controller struct {
	DB           *gorm.DB
	TextChatRepo textchatuser.Repo
}

func NewController(db *gorm.DB, textChatRepo textchatuser.Repo) Controller {
	return Controller{
		DB:           db,
		TextChatRepo: textChatRepo,
	}
}

func (c Controller) AddNewTextChat(user_id string, text string, to_user_id string) (*dto.TextChatDMList, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	data := &textchatuser.TextChatUser{
		ID:         uuid.NewString(),
		ReceiverId: to_user_id,
		SenderId:   user_id,
		Text:       text,
	}

	err := c.TextChatRepo.NewTextChat(tx, data)

	if err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &dto.TextChatDMList{
		ID:         data.ID,
		ReceiverId: data.ReceiverId,
		SenderId:   data.SenderId,
		Text:       data.Text,
		CreatedAt:  data.CreatedAt,
	}, nil

}

func (c Controller) ListTextChat(user_id string, other_user_id string) (*[]dto.TextChatDMList, error) {
	tx := c.DB.Begin()
	defer tx.Rollback()

	data := []textchatuser.TextChatUser{}
	err := c.TextChatRepo.GetAllByUser(tx, &data, user_id, other_user_id)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	response := []dto.TextChatDMList{}
	for _, v := range data {
		response = append(response, dto.TextChatDMList{
			ID:         v.ID,
			ReceiverId: v.ReceiverId,
			SenderId:   v.SenderId,
			Text:       v.Text,
			CreatedAt:  v.CreatedAt,
		})

	}

	return &response, nil
}
