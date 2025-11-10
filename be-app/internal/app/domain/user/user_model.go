package user

import (
	"be-app/internal/app/domain/friend"
	refreshtoken "be-app/internal/app/domain/refresh_token"
	textchatuser "be-app/internal/app/domain/text_chat_user"
	userprofile "be-app/internal/app/domain/user_profile"
	"time"
)

type User struct {
	ID        string `gorm:"primaryKey;type:uuid"`
	Email     string `gorm:"type:varchar(255);unique;not null"`
	Password  string `gorm:"type:varchar(255);not null"`
	CreatedAt time.Time
	UpdatedAt time.Time

	UserProfile userprofile.UserProfile `gorm:"constraint:OnDelete:CASCADE"`

	Refresh refreshtoken.RefreshToken `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`

	SentFriends     []friend.Friend `gorm:"foreignKey:SenderId;constraint:OnDelete:CASCADE"`
	ReceivedFriends []friend.Friend `gorm:"foreignKey:ReceiverId;constraint:OnDelete:CASCADE"`

	SenderTextChat   []textchatuser.TextChatUser `gorm:"foreignKey:SenderId;constraint:OnDelete:CASCADE"`
	ReceiverTextChat []textchatuser.TextChatUser `gorm:"foreignKey:ReceiverId;constraint:OnDelete:CASCADE"`
}

func (u *User) TableName() string {
	return "users"
}
