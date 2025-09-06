package user

import (
	"be-app/internal/errs"
	"errors"

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

func (r Repo) CheckEmailDuplicate(db *gorm.DB, email string) error {
	var count int64
	err := db.Model(&User{}).Where("email = ?", email).Count(&count).Error

	if err != nil {
		return err // error dari DB
	}

	if count > 0 {
		return errs.ErrEmailUsed // <- trigger error kalau sudah ada
	}

	return nil // tidak error = belum digunakan
}

func (r Repo) FindByEmail(db *gorm.DB, email string, user *User) error {
	err := db.Where("email = ?", email).First(user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// data tidak ditemukan
		return errs.ErrUserNotFound
	}

	if err != nil {
		// error lain dari database
		return err
	}

	return nil
}

func (r Repo) FindById(db *gorm.DB, id string, user *User) error {
	return db.Preload("Profile").Where("id = ?", id).First(user).Error
}
