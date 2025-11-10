package entity

import "time"

type JoinServer struct {
	ID        string `gorm:"primaryKey;type:uuid"`
	UserID    string `gorm:"not null"`
	ServerID  string `gorm:"not null"`
	Position  int    `gorm:"not null"`
	IsOwner   bool   `gorm:"not null;type:bool;default:false"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (j *JoinServer) TableName() string {
	return "join_server"
}
