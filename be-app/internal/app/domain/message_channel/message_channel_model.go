package messagechannel

import "time"

type MessageChannel struct {
	ID        string `gorm:"primaryKey;type:uuid"`
	UserId    string `gorm:"not null"`
	ChannelId string `gorm:"not null"`
	Text      string `gorm:"type:text;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (c *MessageChannel) TableName() string {
	return "message_channel"
}
