package entity

import "time"

type ChannelMessage struct {
	ID        string `gorm:"primaryKey;type:uuid"`
	UserID    string `gorm:"not null"`
	ChannelID string `gorm:"not null"`
	Text      string `gorm:"type:text;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time

	Channel Channel
	User    User
}

func (c *ChannelMessage) TableName() string {
	return "channel_message"
}
