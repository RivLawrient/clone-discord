package entity

import "time"

type Channel struct {
	ID                string `gorm:"primaryKey;type:uuid"`
	ServerID          string `gorm:"not null"`
	ChannelCategoryID *string
	Name              string `gorm:"not null"`
	Position          int    `gorm:"not null"`
	IsVoice           bool   `gorm:"not null;type:bool;default:false"`
	CreatedAt         time.Time
	UpdatedAt         time.Time

	ChannelMessage []ChannelMessage
}

func (c *Channel) TableName() string {
	return "channel"
}
