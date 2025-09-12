package joinserver

import "time"

type JoinServer struct {
	ID        string `gorm:"primaryKey;type:uuid"`
	ServerId  string `gorm:"not null"`
	Position  int    `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (j *JoinServer) TableName() string {
	return "join_server"
}
