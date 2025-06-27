package internal

import (
	refreshtoken "be-app/internal/app/domain/refresh_token"
	"be-app/internal/app/domain/user"
	userprofile "be-app/internal/app/domain/user_profile"
	"be-app/internal/app/feature/auth"
	"be-app/internal/route"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type AppsConfig struct {
	DB       *gorm.DB
	App      *fiber.App
	Validate *validator.Validate
}

func Apps(a *AppsConfig) {
	userRepo := user.NewRepo()
	profileRepo := userprofile.NewRepo()
	rTokenRepo := refreshtoken.NewRepo()

	authController := auth.NewController(a.DB, userRepo, profileRepo, rTokenRepo)
	authHandler := auth.NewHandler(*a.Validate, authController)

	route.Routes{
		App:         a.App,
		AuthHandler: authHandler,
	}.SetupRoutes()
}
