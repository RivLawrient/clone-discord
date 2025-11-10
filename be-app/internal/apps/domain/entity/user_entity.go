package entity

import "time"

type User struct {
	ID        string `gorm:"primaryKey;type:uuid"`
	Email     string `gorm:"type:varchar(255);unique;not null"`
	Password  string `gorm:"type:varchar(255);not null"`
	CreatedAt time.Time
	UpdatedAt time.Time

	UserProfile      UserProfile  `gorm:"constraint:OnDelete:CASCADE"`
	RefreshToken     RefreshToken `gorm:"constraint:OnDelete:CASCADE"`
	SentRequests     []Friend     `gorm:"foreignKey:SenderID;constraint:OnDelete:CASCADE"`
	ReceivedRequests []Friend     `gorm:"foreignKey:ReceiverID;constraint:OnDelete:CASCADE"`
	JoinServer       []JoinServer `gorm:"constraint:OnDelete:CASCADE"`
}

func (u *User) TableName() string {
	return "users"
}
