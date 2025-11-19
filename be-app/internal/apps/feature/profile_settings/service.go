package profilesettings

import (
	"be-app/internal/apps/domain/repository"
	"be-app/internal/dto"
	"be-app/internal/errs"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Service struct {
	DB              *gorm.DB
	UserRepo        repository.UserRepo
	UserProfileRepo repository.UserProfileRepo
}

func NewService(db *gorm.DB, userRepo repository.UserRepo, userProfileRepo repository.UserProfileRepo) *Service {
	return &Service{
		DB:              db,
		UserRepo:        userRepo,
		UserProfileRepo: userProfileRepo,
	}
}

func (s *Service) NewUsername(userID string, username string, password string) error {
	tx := s.DB.Begin()
	defer tx.Rollback()

	getPassword := ""
	if err := s.UserRepo.GetPasswordByID(tx, userID, &getPassword); err != nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(getPassword), []byte(password)); err != nil {
		return errs.ErrPasswordNotMatch
	}

	if err := s.UserProfileRepo.CheckUsernameDuplicate(tx, username); err != nil {
		return err
	}

	if err := s.UserProfileRepo.UpdateUsernameByUserID(tx, userID, username); err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *Service) UpdateProfile(userID string, req dto.UpdateProfileRequest, filename string) error {
	tx := s.DB.Begin()
	defer tx.Rollback()

	if err := s.UserProfileRepo.UpdateNameByUserid(tx, userID, req.Name); err != nil {
		return err
	}
	if err := s.UserProfileRepo.UpdateBannerColorByUserid(tx, userID, req.BannerColor); err != nil {
		return err
	}

	if err := s.UserProfileRepo.UpdateBioByUserid(tx, userID, req.Bio); err != nil {
		return err
	}

	if err := s.UserProfileRepo.UpdateAvatarByUserid(tx, userID, filename); err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}
