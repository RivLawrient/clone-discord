package auth

import (
	refreshtoken "be-app/internal/app/domain/refresh_token"
	"be-app/internal/app/domain/user"
	userprofile "be-app/internal/app/domain/user_profile"
	"be-app/internal/dto"
	"be-app/internal/errs"
	"fmt"
	"math/rand"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type StatusActivity string

const (
	StatusOnline  StatusActivity = "Online"
	StatusOffline StatusActivity = "Invisible"
	StatusIdle    StatusActivity = "Idle"
	StatusDND     StatusActivity = "Do Not Disturb"
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

	name := request.Name
	if name == "" {
		name = request.Username
	}

	profile := userprofile.UserProfile{
		ID:             uuid.NewString(),
		UserId:         users.ID,
		Name:           name,
		Username:       request.Username,
		Bio:            "",
		Avatar:         "",
		AvatarBg:       RandomHexColor(),
		BannerColor:    "#ffffff",
		Birthdate:      birth,
		StatusActivity: string(StatusOffline),
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

func RandomHexColor() string {
	// bikin random generator baru dengan seed dari waktu
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	// generate angka antara 0x000000 sampai 0xFFFFFF
	color := r.Intn(0xFFFFFF + 1)

	// format ke hex string dengan 6 digit
	return fmt.Sprintf("#%06X", color)
}

func (a Controller) LoginUser(request *dto.LoginRequest) (*user.User, error) {
	var user user.User
	if err := a.UserRepo.FindByEmail(a.DB, request.Email, &user); err != nil {
		return nil, err
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
	rt.ExpiresAt = time.Now().Add(200 * time.Hour)

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

	// fmt.Println("exp", rt.ExpiresAt)
	// fmt.Println("now", time.Now())
	// fmt.Println("is", rt.ExpiresAt.Before(time.Now()))

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

func (a Controller) NewUsername(user_id string, username string, password string) error {
	tx := a.DB.Begin()
	defer tx.Rollback()

	getPassword := ""
	if err := a.UserRepo.FindPasswordById(tx, user_id, &getPassword); err != nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(getPassword), []byte(password)); err != nil {
		return errs.ErrPasswordNotMatch
	}

	if err := a.ProfileRepo.CheckUsernameDuplicate(tx, username); err != nil {
		return err
	}

	if err := a.ProfileRepo.UpdateUsernameByUserId(tx, user_id, username); err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (a Controller) UpdateProfile(user_id string, request dto.UpdateProfileRequest, filename string) error {
	tx := a.DB.Begin()
	defer tx.Rollback()

	if err := a.ProfileRepo.UpdateNameByUserid(tx, user_id, request.Name); err != nil {
		return err
	}
	if err := a.ProfileRepo.UpdateBannerColorByUserid(tx, user_id, request.BannerColor); err != nil {
		return err
	}

	if err := a.ProfileRepo.UpdateBioByUserid(tx, user_id, request.Bio); err != nil {
		return err
	}

	if err := a.ProfileRepo.UpdateAvatarByUserid(tx, user_id, filename); err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}
