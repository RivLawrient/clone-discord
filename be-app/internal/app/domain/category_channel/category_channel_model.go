package categorychannel

import (
	"be-app/internal/app/domain/channel"
	"time"
)

type CategoryChannel struct {
	ID        string `gorm:"primaryKey;type:uuid"`
	ServerId  string `gorm:"not null;type:uuid"`
	Name      string `gorm:"not null"`
	Position  int    `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time

	Channel []channel.Channel `gorm:"foreignKey:CategoryChannelId;constraint:OnDelete:CASCADE"`
}

func (c *CategoryChannel) TableName() string {
	return "category_channel"
}
