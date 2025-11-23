package dto

import "mime/multipart"

type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email,max=255"`
	Name      string `json:"name" validate:"max=255"`
	Username  string `json:"username" validate:"required,max=255"`
	Password  string `json:"password" validate:"required,min=8,max=100"`
	BirthDate string `json:"birthdate" validate:"required,date"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=8,max=255"`
}

type UpdateProfileRequest struct {
	Name        string                `form:"name"`
	BannerColor string                `form:"banner_color"`
	Bio         string                `form:"bio" validate:"max=50"`
	Avatar      *multipart.FileHeader `form:"avatar"`
}

type NewServerRequest struct {
	Name         string                `form:"name" validate:"required"`
	ProfileImage *multipart.FileHeader `form:"profile_image"`
}

// done

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

type CreateCategoryChannelRequest struct {
	ServerId string `json:"server_id" validate:"required,uuid"`
	Name     string `json:"name" validate:"required"`
}

type CreateChannelRequest struct {
	ServerId   string  `json:"server_id" validate:"required,uuid"`
	Name       string  `json:"name" validate:"required"`
	IsVoice    bool    `json:"is_voice"`
	CategoryId *string `json:"category_id"`
}

type ReorderChannelRequest struct {
	FromCategory int `json:"from_category" validate:"required,min=0"`
	FromPosition int `json:"from_position" validate:"required,min=1"`
	ToCategory   int `json:"to_category" validate:"required,min=0"`
	ToPosition   int `json:"to_position" validate:"required,min=1"`
}

type DeleteChannelRequest struct {
	CategoryId *string `json:"category_id" validate:"omitempty,uuid"`
}

type TextMessageRequest struct {
	Text string `json:"text" validate:"required"`
}

type RenameChannelRequest struct {
	Name string `json:"name" validate:"required"`
}
