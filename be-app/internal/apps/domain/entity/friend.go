package entity

import "time"

type Friend struct {
	ID         string `gorm:"primaryKey;type:uuid"`
	SenderID   string `gorm:"not null"`
	ReceiverID string `gorm:"not null"`
	IsPending  bool
	CreatedAt  time.Time
	UpdatedAt  time.Time

	Sender   User `gorm:"foreignKey:SenderID"`
	Receiver User `gorm:"foreignKey:ReceiverID"`
}

func (f *Friend) TableName() string {
	return "friend"
}
