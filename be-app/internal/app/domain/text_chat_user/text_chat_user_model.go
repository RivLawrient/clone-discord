package textchatuser

import "time"

type TextChatUser struct {
	ID         string `gorm:"primaryKey;type:uuid"`
	ReceiverId string `gorm:"not null"`
	SenderId   string `gorm:"not null"`
	Text       string `gorm:"type:text;not null"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (t *TextChatUser) TableName() string {
	return "text_chat_user"
}
