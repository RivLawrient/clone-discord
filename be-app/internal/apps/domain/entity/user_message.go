package entity

import "time"

type UserMessage struct {
	ID         string `gorm:"primaryKey;type:uuid"`
	SenderID   string `gorm:"not null"`
	ReceiverID string `gorm:"not null"`
	Text       string
	CreatedAt  time.Time
	UpdatedAt  time.Time

	Sender   User `gorm:"foreignKey:SenderID"`
	Receiver User `gorm:"foreignKey:ReceiverID"`
}

func (u *UserMessage) TableName() string {
	return "user_message"
}
