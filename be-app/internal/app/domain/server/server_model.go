package server

import (
	categorychannel "be-app/internal/app/domain/category_channel"
	"be-app/internal/app/domain/channel"
	joinserver "be-app/internal/app/domain/join_server"
	"time"
)

type Server struct {
	ID           string `gorm:"primaryKey;type:uuid"`
	Name         string
	ProfileImage string
	InviteCode   string `gorm:"unique"`
	CreatedAt    time.Time
	UpdatedAt    time.Time

	Join            []joinserver.JoinServer           `gorm:"foreignKey:ServerId;constraint:OnDelete:CASCADE"`
	Channel         []channel.Channel                 `gorm:"foreignKey:ServerId;constraint:OnDelete:CASCADE"`
	CategoryChannel []categorychannel.CategoryChannel `gorm:"foreignKey:ServerId;constraint:OnDelete:CASCADE"`
}

func (s *Server) TableName() string {
	return "server"
}
