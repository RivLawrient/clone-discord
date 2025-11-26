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

type ServerListResponse struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	ProfileImage string `json:"profile_image"`
	InviteCode   string `json:"invite_code"`
	Position     int    `json:"position"`
	IsOwner      bool   `json:"is_owner"`
}

type ServerInvite struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	ProfileImage string `json:"profile_image"`
	TotalOnline  int    `json:"total_online"`
	TotalMember  int    `json:"total_member"`
}

type CategoryChannel struct {
	ID       string        `json:"id"`
	Name     string        `json:"name"`
	Position int           `json:"position"`
	Channel  []ChannelList `json:"channel"`
}

type ChannelList struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	IsVoice  bool   `json:"is_voice"`
	Position int    `json:"position"`
}

type ServerList struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	ProfileImage string `json:"profile_image"`
	InviteCode   string `json:"invite_code"`
	Position     int    `json:"position"`
	IsOwner      bool   `json:"is_owner"`
}

// done

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

type ChannelCategory struct {
	ServerId string            `json:"server_id"`
	Channel  []ChannelList     `json:"channel"`
	Category []CategoryChannel `json:"category"`
}

type ChannelCategorySocket struct {
	ServerId string          `json:"server_id"`
	List     ChannelCategory `json:"list"`
}
type UserOther struct {
	UserId         string `json:"user_id"`
	Name           string `json:"name"`
	Username       string `json:"username"`
	Avatar         string `json:"avatar"`
	AvatarBg       string `json:"avatar_bg"`
	StatusActivity string `json:"status_activity"`
	Bio            string `json:"bio"`
	BannerColor    string `json:"banner_color"`
}
type MessageChannel struct {
	ID        string    `json:"id"`
	User      UserOther `json:"user"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"created_at"`
}
type MessageUser struct {
	ID        string    `json:"id"`
	User      UserOther `json:"user"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"created_at"`
}

type MessageChannelSocket struct {
	ChannelId      string         `json:"channel_id"`
	MessageChannel MessageChannel `json:"message_channel"`
}

type ServerMember struct {
	UserID         string `json:"user_id"`
	Name           string `json:"name"`
	Username       string `json:"username"`
	Avatar         string `json:"avatar"`
	AvatarBg       string `json:"avatar_bg"`
	StatusActivity string `json:"status_activity"`
	Bio            string `json:"bio"`
	BannerColor    string `json:"banner_color"`
}
