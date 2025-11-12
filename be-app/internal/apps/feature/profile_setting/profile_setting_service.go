package profilesetting

import (
	"be-app/internal/apps/domain/repository"
	"be-app/internal/dto"

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

func (s *Service) NewUsername(userID string, username string) error {
	return nil
}

func (s *Service) UpdateProfile(userID string, req dto.UpdateProfileRequest) error {
	return nil
}
