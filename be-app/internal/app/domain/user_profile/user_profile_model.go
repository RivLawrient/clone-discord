package userprofile

import (
	"time"
)

type UserProfile struct {
	ID        string    `gorm:"primaryKey;type:uuid"`
	UserId    string    `gorm:"unique;not null"`
	Name      string    `gorm:"type:varchar(255);not null"`
	Username  string    `gorm:"type:varchar(255);unique;not null;unique"`
	Bio       string    `gorm:"type:text"`
	Avatar    string    `gorm:"type:varchar(255)"`
	Birthdate time.Time `gorm:"type:date;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *UserProfile) TableName() string {
	return "user_profile"
}
