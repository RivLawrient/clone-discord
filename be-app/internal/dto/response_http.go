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
	StatusActivity string `json:"status_activity"`
}

type FriendList struct {
	UserId         string    `json:"user_id"`
	IsPending      bool      `json:"is_pending"`
	Name           string    `json:"name"`
	Username       string    `json:"username"`
	Avatar         string    `json:"avatar"`
	CreatedAt      time.Time `json:"created_at"`
	StatusActivity string    `json:"status_activity"`
}

type GroupFriendList struct {
	All     *[]FriendList `json:"all"`
	Sent    *[]FriendList `json:"sent"`
	Request *[]FriendList `json:"request"`
}

type StatusUpdate struct {
	UserId         string `json:"user_id"`
	StatusActivity string `json:"status_activity"`
}
