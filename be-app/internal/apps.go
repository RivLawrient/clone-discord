package internal

import (
	"be-app/internal/route"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type AppsConfig struct {
	DB  *gorm.DB
	App *fiber.App
}

func Apps(a *AppsConfig) {
	route.SetupRoutes(a.App)

}
