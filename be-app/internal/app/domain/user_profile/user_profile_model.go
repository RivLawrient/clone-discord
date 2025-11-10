package userprofile

import (
	"time"
)

type UserProfile struct {
	ID             string    `gorm:"primaryKey;type:uuid"`
	UserID         string    `gorm:"unique;not null"`
	Name           string    `gorm:"type:varchar(255);not null"`
	Username       string    `gorm:"type:varchar(255);unique;not null;unique"`
	Bio            string    `gorm:"type:text"`
	Avatar         string    `gorm:"type:varchar(255)"`
	AvatarBg       string    `gorm:"type:varchar(7)"`
	BannerColor    string    `gorm:"type:varchar(7)"`
	Birthdate      time.Time `gorm:"type:date;not null"`
	StatusActivity string    `gorm:"type:varchar(255);default:'Invisible'"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

func (u *UserProfile) TableName() string {
	return "user_profile"
}
