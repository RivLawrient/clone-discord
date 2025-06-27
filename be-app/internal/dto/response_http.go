package dto

type TokenResponse struct {
	Email string `json:"email"`
	Token string `json:"token"`
}

type AuthMeReponse struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Bio      string `json:"bio"`
	Avatar   string `json:"avatar"`
}
