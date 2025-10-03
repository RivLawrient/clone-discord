package server

import (
	joinserver "be-app/internal/app/domain/join_server"
	"time"
)

type Server struct {
	ID           string `gorm:"primaryKey;type:uuid"`
	Name         string
	ProfileImage string
	CreatedAt    time.Time
	UpdatedAt    time.Time

	Join []joinserver.JoinServer `gorm:"foreignKey:ServerId;constraint:OnDelete:CASCADE"`
}

func (s *Server) TableName() string {
	return "server"
}
