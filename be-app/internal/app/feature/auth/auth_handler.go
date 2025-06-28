package auth

import (
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"errors"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Validate       validator.Validate
	AuthController Controller
}

func NewHandler(validate validator.Validate, authController Controller) Handler {
	return Handler{
		Validate:       validate,
		AuthController: authController,
	}
}

func (a Handler) RegisterHandler(c *fiber.Ctx) error {
	request := new(dto.RegisterRequest)
	c.BodyParser(request)

	if err := a.Validate.Struct(request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	response, err := a.AuthController.RegisterUser(request)
	if err != nil {
		if errors.Is(err, errs.ErrEmailUsed) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
				Message: "validation failed",
				Data: map[string]string{
					"email": err.Error(),
				},
			})
		}

		if errors.Is(err, errs.ErrUserNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
				Message: "validation failed",
				Data: map[string]string{
					"username": err.Error(),
				},
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	token, err := helper.GenerateJWT(response.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: "something wrong",
		})
	}

	refreshToken, err := a.AuthController.GenerateRefreshToken(c, response.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[string]{
			Message: "failed to generate token",
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken.Token,
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Strict",
		Path:     "/auth/refresh", // hanya endpoint ini yang bisa akses
		Expires:  time.Now().Add(7 * 24 * time.Hour),
	})

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.TokenResponse]{
		Message: "register success",
		Data: dto.TokenResponse{
			Email: response.Email,
			Token: token,
		},
	})

}

func (a Handler) LoginHandler(c *fiber.Ctx) error {
	request := new(dto.LoginRequest)
	c.BodyParser(request)

	if err := a.Validate.Struct(request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	response, err := a.AuthController.LoginUser(request)
	if err != nil {
		if errors.Is(err, errs.ErrUserNotFound) {
			return c.Status(fiber.StatusUnauthorized).JSON(dto.ResponseWeb[string]{
				Message: err.Error(),
				Data:    "email or password is invalid",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	token, err := helper.GenerateJWT(response.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	refreshToken, err := a.AuthController.GenerateRefreshToken(c, response.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[string]{
			Message: "failed to generate token",
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken.Token,
		HTTPOnly: true,
		Secure:   true,
		SameSite: "Strict",
		Path:     "/auth/refresh", // hanya endpoint ini yang bisa akses
		Expires:  time.Now().Add(7 * 24 * time.Hour),
	})

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.TokenResponse]{
		Message: "register success",
		Data: dto.TokenResponse{
			Email: response.Email,
			Token: token,
		},
	})
}
func (a Handler) MeHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)

	response, err := a.AuthController.UserLogged(user_id)
	if err != nil {
		if errors.Is(err, errs.ErrUserNotFound) || errors.Is(err, errs.ErrUserLogout) {
			return c.Status(fiber.StatusUnauthorized).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.AuthMeReponse]{
		Message: "user logged",
		Data: dto.AuthMeReponse{
			Email:    response.Email,
			Name:     response.Profile.Name,
			Username: response.Profile.Username,
			Bio:      response.Profile.Bio,
			Avatar:   response.Profile.Avatar,
		},
	})
}
func (a Handler) RefreshJWTHandler(c *fiber.Ctx) error {
	cookie_token := c.Cookies("refresh_token")
	if cookie_token == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(dto.ResponseWeb[any]{
			Message: "refresh token missing",
		})
	}

	refresh, err := a.AuthController.ValidateRefreshToken(cookie_token)
	if err != nil {
		if errors.Is(err, errs.ErrTokenExpired) {
			c.Cookie(&fiber.Cookie{
				Name:     "refresh_token",
				Value:    "",
				Expires:  time.Now().Add(-time.Hour), // expired di masa lalu
				HTTPOnly: true,
				Secure:   true,
				SameSite: "Strict",
				Path:     "/auth/refresh", // harus sama persis dengan saat set
			})

			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		c.Cookie(&fiber.Cookie{
			Name:     "refresh_token",
			Value:    "",
			Expires:  time.Now().Add(-time.Hour), // expired di masa lalu
			HTTPOnly: true,
			Secure:   true,
			SameSite: "Strict",
			Path:     "/auth/refresh", // harus sama persis dengan saat set
		})

		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "token is invalid",
		})
	}

	token, err := helper.GenerateJWT(refresh.UserID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: "something wrong",
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "refresh success",
		Data: fiber.Map{
			"token": token,
		},
	})
}

func (a Handler) LogoutHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)

	if err := a.AuthController.RemoveRefreshToken(user_id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: "something wrong",
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "logout success",
	})
}
