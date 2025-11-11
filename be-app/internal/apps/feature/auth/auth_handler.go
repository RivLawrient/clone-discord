package auth

import (
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Service  Service
	Validate validator.Validate
}

func NewHandler(service Service, validate validator.Validate) *Handler {
	return &Handler{
		Service:  service,
		Validate: validate,
	}
}

func (h *Handler) RegisterUserHandler(c *fiber.Ctx) error {
	req := new(dto.RegisterRequest)
	c.BodyParser(req)

	if err := h.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	response, token, err := h.Service.RegisterUser(*req, c.Get("User-Agent"), c.IP())
	if err != nil {
		if errors.Is(err, errs.ErrEmailUsed) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
				Message: "validation failed",
				Data: map[string]string{
					"email": err.Error(),
				},
			})
		}

		if errors.Is(err, errs.ErrUsernameUsed) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
				Message: "validation failed",
				Data: map[string]string{
					"username": err.Error(),
				},
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    response.RefreshToken.Token,
		HTTPOnly: true,
		SameSite: "Strict",
		Path:     "/auth/refresh",
	})

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.TokenResponse]{
		Message: "register success",
		Data: dto.TokenResponse{
			Email: response.Email,
			Token: *token,
		},
	})
}

func (h *Handler) LoginUserHandler(c *fiber.Ctx) error {
	req := new(dto.LoginRequest)
	c.BodyParser(req)

	if err := h.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	response, token, err := h.Service.LoginUser(*req, c.Get("User-Agent"), c.IP())
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

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    response.RefreshToken.Token,
		HTTPOnly: true,
		SameSite: "Strict",
		Path:     "/auth/refresh",
	})

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.TokenResponse]{
		Message: "login success",
		Data: dto.TokenResponse{
			Email: response.Email,
			Token: *token,
		},
	})
}

func (h *Handler) MeHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	response, err := h.Service.Me(userID)
	if err != nil {
		if errors.Is(err, errs.ErrUserNotFound) || errors.Is(err, errs.ErrUserLogout) {
			return c.Status(fiber.StatusUnauthorized).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.AuthMeReponse]{
		Message: "success get user logged",
		Data: dto.AuthMeReponse{
			Email:          response.Email,
			Name:           response.UserProfile.Name,
			Username:       response.UserProfile.Username,
			Bio:            response.UserProfile.Bio,
			Avatar:         response.UserProfile.Avatar,
			AvatarBg:       response.UserProfile.AvatarBg,
			BannerColor:    response.UserProfile.BannerColor,
			StatusActivity: response.UserProfile.StatusActivity,
		},
	})
}

func (h *Handler) RefreshTokenHandler(c *fiber.Ctx) error {
	refreshToken := c.Cookies("refresh_token")
	if refreshToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(dto.ResponseWeb[any]{
			Message: "refresh token missing",
		})
	}

	token, err := h.Service.RefreshJWT(refreshToken)
	if err != nil {
		c.Cookie(&fiber.Cookie{
			Name:     "refresh_token",
			Value:    "",
			HTTPOnly: true,
			SameSite: "Strict",
			Path:     "/auth/refresh",
		})

		if errors.Is(err, errs.ErrTokenExpired) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "refresh success",
		Data: fiber.Map{
			"token": token,
		},
	})
}

func (h *Handler) LogoutHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	if err := h.Service.Logout(userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HTTPOnly: true,
		SameSite: "Strict",
		Path:     "/auth/refresh",
	})

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "logout success",
	})
}
