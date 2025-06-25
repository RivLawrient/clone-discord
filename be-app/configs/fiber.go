package configs

import (
	"be-app/internal/route"
	"os"

	"github.com/gofiber/fiber/v2"
)

func NewFiber() *fiber.App {
	app := fiber.New(fiber.Config{
		AppName:      os.Getenv("APP_NAME"),
		BodyLimit:    20 * 1024 * 1024,
		ErrorHandler: route.RouteNotFound,
	})
	return app
}
