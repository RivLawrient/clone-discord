package user

import (
	userprofile "be-app/internal/app/domain/user_profile"
	"time"
)

type User struct {
	ID        string `gorm:"primaryKey;type:uuid"`
	Email     string `gorm:"type:varchar(255);unique;not null"`
	Password  string `gorm:"type:varchar(255);not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Profile   userprofile.UserProfile `gorm:"foreignKey:UserId;constraint:OnDelete:SET NULL"`
}

func (u *User) TableName() string {
	return "users"
}
