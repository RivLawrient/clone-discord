package entity

import (
	"time"
)

type ChannelCategory struct {
	ID        string `gorm:"primaryKey;type:uuid"`
	ServerID  string `gorm:"not null"`
	Name      string `gorm:"not null"`
	Position  int    `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time

	Channel []Channel `gorm:"constraint:OnDelete:CASCADE"`
}

func (c *ChannelCategory) TableName() string {
	return "channel_category"
}

