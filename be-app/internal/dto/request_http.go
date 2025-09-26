package dto

import "mime/multipart"

type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Name      string `json:"name" validate:"max=255"`
	Username  string `json:"username" validate:"required,max=255"`
	Password  string `json:"password" validate:"required,min=8,max=100"`
	BirthDate string `json:"birthdate" validate:"required,date"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=255"`
}

type NewFriendRequest struct {
	Username string `json:"username" validate:"required"`
}

type TextChatRequest struct {
	Text string `json:"text" validate:"required"`
}

type ChangeUsernameRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type UpdateProfileRequest struct {
	Name        string                `form:"name"`
	BannerColor string                `form:"banner_color"`
	Bio         string                `form:"bio" validate:"max=50"`
	Avatar      *multipart.FileHeader `form:"avatar"`
}
