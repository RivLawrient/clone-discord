package errs

import "errors"

var (
	ErrEmailUsed        = errors.New("email already used")
	ErrUsernameUsed     = errors.New("username already used")
	ErrUserNotFound     = errors.New("user not found")
	ErrUserLogout       = errors.New("user was logout")
	ErrTokenNotFound    = errors.New("token not found")
	ErrTokenExpired     = errors.New("token is expired")
	ErrInternal         = errors.New("internal server error")
	ErrFriendAdded      = errors.New("user already added to your friend")
	ErrPasswordNotMatch = errors.New("password does not match")
)
