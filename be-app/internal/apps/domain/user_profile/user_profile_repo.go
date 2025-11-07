package userprofile

import (
	"gorm.io/gorm"
)

type Repo struct {
}

func NewRepo() Repo {
	return Repo{}
}

func (r Repo) Create(db *gorm.DB, profile *UserProfile) error {
	return db.Create(profile).Error
}
