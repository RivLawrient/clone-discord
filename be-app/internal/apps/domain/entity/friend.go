package entity

import "time"

type Friend struct {
	ID         string `gorm:"primaryKey;type:uuid"`
	SenderID   string `gorm:"not null"`
	ReceiverID string `gorm:"not null"`
	IsPending  bool
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (f *Friend) TableName() string {
	return "friend"
}
