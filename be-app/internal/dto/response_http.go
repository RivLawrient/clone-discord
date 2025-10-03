package dto

import "time"

type TokenResponse struct {
	Email string `json:"email"`
	Token string `json:"token"`
}

type AuthMeReponse struct {
	Email          string `json:"email"`
	Name           string `json:"name"`
	Username       string `json:"username"`
	Bio            string `json:"bio"`
	Avatar         string `json:"avatar"`
	AvatarBg       string `json:"avatar_bg"`
	BannerColor    string `json:"banner_color"`
	StatusActivity string `json:"status_activity"`
}

type FriendList struct {
	UserId         string    `json:"user_id"`
	IsPending      bool      `json:"is_pending"`
	Name           string    `json:"name"`
	Username       string    `json:"username"`
	Avatar         string    `json:"avatar"`
	AvatarBg       string    `json:"avatar_bg"`
	CreatedAt      time.Time `json:"created_at"`
	StatusActivity string    `json:"status_activity"`
}

type GroupFriendList struct {
	All     *[]FriendList `json:"all"`
	Sent    *[]FriendList `json:"sent"`
	Request *[]FriendList `json:"request"`
}

type OtherUser struct {
	UserId         string    `json:"user_id"`
	Name           string    `json:"name"`
	Username       string    `json:"username"`
	Avatar         string    `json:"avatar"`
	CreatedAt      time.Time `json:"created_at"`
	StatusActivity string    `json:"status_activity"`
}

type StatusUpdate struct {
	UserId         string `json:"user_id"`
	StatusActivity string `json:"status_activity"`
}

type TextChatDMList struct {
	ID         string    `json:"id"`
	ReceiverId string    `json:"receiver_id"`
	SenderId   string    `json:"sender_id"`
	Text       string    `json:"text"`
	CreatedAt  time.Time `json:"created_at"`
}

type ServerList struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	ProfileImage string `json:"profile_image"`
	Position     int    `json:"position"`
}
