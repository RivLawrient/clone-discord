package auth

import (
	refreshtoken "be-app/internal/app/domain/refresh_token"
	"be-app/internal/app/domain/user"
	userprofile "be-app/internal/app/domain/user_profile"
	"be-app/internal/dto"
	"be-app/internal/errs"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Controller struct {
	DB          *gorm.DB
	UserRepo    user.Repo
	ProfileRepo userprofile.Repo
	RTokenRepo  refreshtoken.Repo
}

func NewController(db *gorm.DB, userRepo user.Repo, profileRepo userprofile.Repo, rTokenRepo refreshtoken.Repo) Controller {
	return Controller{
		DB:          db,
		UserRepo:    userRepo,
		ProfileRepo: profileRepo,
		RTokenRepo:  rTokenRepo,
	}
}

func (a Controller) RegisterUser(request *dto.RegisterRequest) (*user.User, error) {
	tx := a.DB.Begin()
	defer tx.Rollback()

	if err := a.UserRepo.CheckEmailDuplicate(tx, request.Email); err != nil {
		return nil, err
	}
	password, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	users := user.User{
		ID:       uuid.NewString(),
		Email:    request.Email,
		Password: string(password),
	}

	if err := a.UserRepo.NewUser(tx, &users); err != nil {
		return nil, err
	}

	if err := a.ProfileRepo.CheckUsernameDuplicate(tx, request.Username); err != nil {
		return nil, err
	}

	birth, err := time.Parse("2006-01-02", request.BirthDate)
	if err != nil {
		return nil, err
	}

	profile := userprofile.UserProfile{
		ID:        uuid.NewString(),
		UserId:    users.ID,
		Name:      request.Name,
		Username:  request.Username,
		Bio:       "",
		Avatar:    "",
		Birthdate: birth,
	}

	if err := a.ProfileRepo.Create(tx, &profile); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &user.User{
		ID:    users.ID,
		Email: users.Email,
		Profile: userprofile.UserProfile{
			ID:       profile.ID,
			Name:     profile.Name,
			Username: profile.Username,
		},
	}, nil
}

func (a Controller) LoginUser(request *dto.LoginRequest) (*user.User, error) {
	var user user.User
	if err := a.UserRepo.FindByEmail(a.DB, request.Email, &user); err != nil {
		return nil, errs.ErrUserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password)); err != nil {
		return nil, errs.ErrUserNotFound
	}

	return &user, nil
}

func (a Controller) GenerateRefreshToken(c *fiber.Ctx, user_id string) (*refreshtoken.RefreshToken, error) {
	tx := a.DB.Begin()
	defer tx.Rollback()

	var rt refreshtoken.RefreshToken

	//cek token by user_id
	if err := a.RTokenRepo.FindByUserId(tx, user_id, &rt); err == nil {
		// kalo ada hapus dulu
		if err := a.RTokenRepo.DeleteByUserId(tx, user_id); err != nil {
			return nil, errs.ErrInternal
		}
	}

	rt.ID = uuid.NewString()
	rt.UserID = user_id
	rt.Token = uuid.NewString()
	rt.UserAgent = c.Get("User-Agent")
	rt.IPAddress = c.IP()
	rt.ExpiresAt = time.Now().Add(7 * 24 * time.Hour)

	if err := a.RTokenRepo.Create(tx, &rt); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return &rt, nil
}
func (a Controller) RemoveRefreshToken(user_id string) error {
	if err := a.RTokenRepo.DeleteByUserId(a.DB, user_id); err != nil {
		return err
	}

	return nil
}
func (a Controller) ValidateRefreshToken(token string) (*refreshtoken.RefreshToken, error) {
	var rt refreshtoken.RefreshToken
	if err := a.RTokenRepo.FindByToken(a.DB, token, &rt); err != nil {
		return nil, err
	}

	if rt.ExpiresAt.Before(time.Now()) {
    return nil, errs.ErrTokenExpired
}

	return &rt, nil
}

func (a Controller) UserLogged(user_id string) (*user.User, error) {
	var user user.User

	if err := a.UserRepo.FindById(a.DB, user_id, &user); err != nil {
		return nil, errs.ErrUserNotFound
	}

	if err := a.RTokenRepo.FindByUserId(a.DB, user_id, &refreshtoken.RefreshToken{}); err != nil {
		return nil, errs.ErrUserLogout
	}

	return &user, nil
}
