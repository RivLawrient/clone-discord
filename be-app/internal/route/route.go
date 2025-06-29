package route

import (
	"be-app/internal/app/feature/auth"
	"be-app/internal/dto"
	"be-app/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type Routes struct {
	App         *fiber.App
	AuthHandler auth.Handler
}

func (r Routes) SetupRoutes() {
	r.App.Use(cors.New(cors.Config{
		AllowOrigins:     "http://127.0.0.1:3000, http://145.79.11.111:3000",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Content-Type, Authorization, Origin, Accept",
		AllowCredentials: true,
	}))
	r.App.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(dto.ResponseWeb[interface{}]{
			Message: "This yout root api",
		})
	})

	r.App.Post("/auth/register", r.AuthHandler.RegisterHandler)
	r.App.Post("/auth/login", r.AuthHandler.LoginHandler)
	r.App.Post("/auth/logout", middleware.RequireJWTAuth(), r.AuthHandler.LogoutHandler)
	r.App.Get("/auth/refresh", r.AuthHandler.RefreshJWTHandler)
	r.App.Get("/auth/me", middleware.RequireJWTAuth(), r.AuthHandler.MeHandler)
}

func RouteNotFound(c *fiber.Ctx, err error) error {
	if fiberErr, ok := err.(*fiber.Error); ok {
		if fiberErr.Code == fiber.StatusMethodNotAllowed {
			return c.Status(fiber.StatusMethodNotAllowed).JSON(dto.ResponseWeb[interface{}]{
				Message: "Method is not allowed",
			})
		}
		if fiberErr.Code == fiber.StatusNotFound {
			return c.Status(fiber.StatusNotFound).JSON(dto.ResponseWeb[interface{}]{
				Message: "Route is not found",
			})
		}
	}

	return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[interface{}]{
		Message: "Internal Server Error",
	})
}
