package friend

import (
	"time"
)

type Friend struct {
	ID         string `gorm:"primaryKey;type:uuid"`
	SenderId   string `gorm:"not null"`
	ReceiverId string `gorm:"not null"`
	IsPending  bool
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (f *Friend) TableName() string {
	return "friend"
}
