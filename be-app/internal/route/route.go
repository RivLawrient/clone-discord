package route

import (
	"be-app/internal/dto"

	"github.com/gofiber/fiber/v2"
)

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



func SetupRoutes(app *fiber.App) {

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(dto.ResponseWeb[interface{}]{
			Message: "This yout root api",
		})

	})

}
