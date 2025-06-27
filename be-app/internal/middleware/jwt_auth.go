package middleware

import (
	"be-app/internal/dto"
	"be-app/internal/helper"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func RequireJWTAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")

		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(dto.ResponseWeb[interface{}]{
				Message: "missing or invalid authorization header",
			})
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		claims, err := helper.ParseJWT(tokenStr)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(dto.ResponseWeb[interface{}]{
				Message: "invalid or expired token",
			})
		}

		// Ambil user_id dari claims dan simpan di context
		userID := claims["user_id"].(string)
		c.Locals("user_id", userID)

		return c.Next()
	}
}
