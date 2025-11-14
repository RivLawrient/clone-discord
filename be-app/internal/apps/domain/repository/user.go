package repository

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/errs"
	"errors"

	"gorm.io/gorm"
)

type UserRepo struct{}

func NewUserRepo() *UserRepo {
	return &UserRepo{}
}

func (r *UserRepo) CheckEmailDuplicate(db *gorm.DB, email string) error {
	var count int64
	err := db.Model(&entity.User{}).Where("email = ?", email).Count(&count).Error

	if err != nil {
		return err // error dari DB
	}

	if count > 0 {
		return errs.ErrEmailUsed // <- trigger error kalau sudah ada
	}

	return nil
}

func (r *UserRepo) Create(db *gorm.DB, user *entity.User) error {
	return db.Create(user).Error
}

func (r *UserRepo) FindByEmail(db *gorm.DB, email string, user *entity.User) error {
	err := db.Where("email = ?", email).First(user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// data tidak ditemukan
		return errs.ErrUserNotFound
	}

	if err != nil {
		return err
	}

	return nil
}

func (r *UserRepo) FindByID(db *gorm.DB, id string, user *entity.User) error {
	return db.Preload("UserProfile").Where("id = ?", id).First(user).Error
}
