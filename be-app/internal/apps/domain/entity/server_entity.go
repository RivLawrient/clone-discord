package entity

import (
	"time"
)

type Server struct {
	ID           string `gorm:"primaryKey;type:uuid"`
	Name         string
	ProfileImage string
	InviteCode   string `gorm:"unique"`
	CreatedAt    time.Time
	UpdatedAt    time.Time

	JoinServer      []JoinServer      `gorm:"constraint:OnDelete:CASCADE"`
	Channel         []Channel         `gorm:"constraint:OnDelete:CASCADE"`
	ChannelCategory []ChannelCategory `gorm:"constraint:OnDelete:CASCADE"`
}

func (s *Server) TableName() string {
	return "server"
}
