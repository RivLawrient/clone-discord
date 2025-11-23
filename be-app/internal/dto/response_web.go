package dto

type ResponseWeb[T any] struct {
	Message string `json:"message"`
	Data    T      `json:"data"`
}

type ResponseSocket[T any] struct {
	Type string `json:"type"`
	Data T      `json:"data"`
}
