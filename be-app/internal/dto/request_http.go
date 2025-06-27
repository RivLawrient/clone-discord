package dto

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
