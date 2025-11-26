package auth

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/apps/domain/repository"
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Service struct {
	DB               *gorm.DB
	UserRepo         repository.UserRepo
	UserProfileRepo  repository.UserProfileRepo
	RefreshTokenRepo repository.RefreshTokenRepo
}

func NewService(db *gorm.DB, userRepo repository.UserRepo, userProfileRepo repository.UserProfileRepo, refreshTokenRepo repository.RefreshTokenRepo) *Service {
	return &Service{
		DB:               db,
		UserRepo:         userRepo,
		UserProfileRepo:  userProfileRepo,
		RefreshTokenRepo: refreshTokenRepo,
	}
}

func (s *Service) RegisterUser(req dto.RegisterRequest, userAgent string, IP string) (*entity.User, *string, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	if err := s.UserRepo.CheckEmailDuplicate(tx, req.Email); err != nil {
		return nil, nil, err
	}

	password, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, err
	}

	birth, err := time.Parse("2006-01-02", req.Birthdate)
	if err != nil {
		return nil, nil, err
	}

	currentYear := time.Now().Year()

	// Validasi tahun
	if birth.Year() < 1950 || birth.Year() > currentYear {
		return nil, nil, errs.ErrInvalidBirthdate
	}

	// Opsional: tidak boleh tanggal masa depan sama sekali
	if birth.After(time.Now()) {
		return nil, nil, errs.ErrInvalidBirthdate
	}

	name := req.Name
	if name == "" {
		name = req.Username
	}

	newUserProfil := entity.UserProfile{
		ID:          uuid.NewString(),
		Name:        name,
		Username:    req.Username,
		Bio:         "",
		Avatar:      "",
		AvatarBg:    helper.RandomHexColor(),
		BannerColor: "#ffffff",
		Birthdate:   birth,
		// StatusActivity: string(StatusOffline),
	}

	newUser := entity.User{
		ID:          uuid.NewString(),
		Email:       req.Email,
		Password:    string(password),
		UserProfile: newUserProfil,
	}

	if err := s.UserRepo.Create(tx, &newUser); err != nil {
		return nil, nil, err
	}

	if err := s.generateRefreshToken(tx, &newUser.RefreshToken, newUser.ID, userAgent, IP); err != nil {
		return nil, nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, err
	}

	token, err := helper.GenerateJWT(newUser.ID)
	if err != nil {
		return nil, nil, err
	}

	return &newUser, &token, nil
}

func (s *Service) LoginUser(req dto.LoginRequest, userAgent string, IP string) (*entity.User, *string, error) {
	tx := s.DB.Begin()
	defer tx.Rollback()

	var user entity.User
	if err := s.UserRepo.FindByEmail(s.DB, req.Email, &user); err != nil {
		return nil, nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, nil, errs.ErrUserNotFound
	}

	if err := s.generateRefreshToken(tx, &user.RefreshToken, user.ID, userAgent, IP); err != nil {
		return nil, nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, err
	}

	token, err := helper.GenerateJWT(user.ID)
	if err != nil {
		return nil, nil, err
	}

	return &user, &token, nil
}

// hanya digunakan saat register atau login
func (s *Service) generateRefreshToken(db *gorm.DB, rt *entity.RefreshToken, userID string, userAgent string, IP string) error {
	if err := s.RefreshTokenRepo.FindByUserID(db, userID, rt); err == nil {
		if err := s.RefreshTokenRepo.DeleteByUserID(db, userID); err != nil {
			return err
		}
	}

	rt.ID = uuid.NewString()
	rt.UserID = userID
	rt.Token = uuid.NewString()
	rt.UserAgent = userAgent
	rt.IPAddress = IP
	rt.ExpiresAt = time.Now().Add(200 * time.Hour)

	if err := s.RefreshTokenRepo.Create(db, rt); err != nil {
		return err
	}

	return nil
}

// return data user yang sedang login
func (s *Service) Me(userID string) (*entity.User, error) {
	var user entity.User

	if err := s.UserRepo.FindByID(s.DB, userID, &user); err != nil {
		return nil, err
	}

	if err := s.RefreshTokenRepo.FindByUserID(s.DB, userID, &user.RefreshToken); err != nil {
		return nil, errs.ErrUserLogout
	}

	return &user, nil
}

func (s *Service) RefreshJWT(refreshToken string) (*string, error) {
	var rt entity.RefreshToken
	//melakukan validasi pada token terlebih dahulu
	if err := s.RefreshTokenRepo.FindByToken(s.DB, refreshToken, &rt); err != nil {
		return nil, err
	}

	//cek expire token
	if rt.ExpiresAt.Before(time.Now()) {
		return nil, errs.ErrTokenExpired
	}

	token, err := helper.GenerateJWT(rt.UserID)
	if err != nil {
		return nil, err
	}

	return &token, nil
}

func (s *Service) Logout(userID string) error {
	return s.RefreshTokenRepo.DeleteByUserID(s.DB, userID)
}
