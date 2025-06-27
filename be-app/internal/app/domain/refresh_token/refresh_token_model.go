package refreshtoken

import "time"

type RefreshToken struct {
	ID        string `gorm:"primaryKey;type:uuid"`
	UserID    string `gorm:"type:uuid;not null;unique"`
	Token     string `gorm:"not null;unique"`
	UserAgent string
	IPAddress string
	ExpiresAt time.Time
	CreatedAt time.Time
}

func (r *RefreshToken) TableName() string {
	return "refresh_token"
}
