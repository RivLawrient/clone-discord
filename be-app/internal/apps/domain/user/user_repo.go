package user

import (
	"gorm.io/gorm"
)

type Repo struct {
}

func NewRepo() Repo {
	return Repo{}
}

func (r Repo) NewUser(db *gorm.DB, user *User) error {
	return db.Create(user).Error
}
