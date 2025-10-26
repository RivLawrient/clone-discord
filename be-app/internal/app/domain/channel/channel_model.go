package channel

import "time"

type Channel struct {
	ID                string `gorm:"primaryKey;type:uuid"`
	ServerId          string
	CategoryChannelId *string
	Name              string `gorm:"not null"`
	Position          int    `gorm:"not null"`
	IsVoice           bool   `gorm:"not null;type:bool;default:false"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

func (c *Channel) TableName() string {
	return "channel"
}
