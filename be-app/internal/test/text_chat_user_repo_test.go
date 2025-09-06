package test

import (
	textchatuser "be-app/internal/app/domain/text_chat_user"
	"encoding/json"
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestNewChat(t *testing.T) {
	chat_repo := textchatuser.NewRepo()

	u1, u2, u3 := seedUserAndProfile(t)

	err := chat_repo.NewTextChat(db, &textchatuser.TextChatUser{
		ID:         uuid.NewString(),
		ReceiverId: u1.ID,
		SenderId:   u2.ID,
		Text:       "random",
	})
	assert.Nil(t, err)
	err = chat_repo.NewTextChat(db, &textchatuser.TextChatUser{
		ID:         uuid.NewString(),
		ReceiverId: u2.ID,
		SenderId:   u1.ID,
		Text:       "anjaiii",
	})
	assert.Nil(t, err)

	err = chat_repo.NewTextChat(db, &textchatuser.TextChatUser{
		ID:         uuid.NewString(),
		ReceiverId: u2.ID,
		SenderId:   u3.ID,
		Text:       "random",
	})
	assert.Nil(t, err)

	err = chat_repo.NewTextChat(db, &textchatuser.TextChatUser{
		ID:         uuid.NewString(),
		ReceiverId: u3.ID,
		SenderId:   u1.ID,
		Text:       "random",
	})
	assert.Nil(t, err)

	data := []textchatuser.TextChatUser{}
	chat_repo.GetAllByUser(db, &data, u1.ID, u2.ID)

	bytes, _ := json.MarshalIndent(data, "", "  ")
	fmt.Println(string(bytes))
}
