package auth

import (
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"errors"
	"log"
	"os"
	"path/filepath"
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
	errd := c.BodyParser(request)
	log.Println(errd)

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

		if errors.Is(err, errs.ErrUsernameUsed) {
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
		// Secure:   true,
		SameSite: "Strict",
		Path:     "/auth/refresh", // hanya endpoint ini yang bisa akses
		// Expires:  refreshToken.ExpiresAt,
		// Expires:  time.Now().Add(7 * 24 * time.Hour),
		// Expires: time.Now().Add(2 * time.Minute),
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
		// Secure:   true,
		SameSite: "Strict",
		Path:     "/auth/refresh", // hanya endpoint ini yang bisa akses
		// Expires:  refreshToken.ExpiresAt,
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
			Email:          response.Email,
			Name:           response.Profile.Name,
			Username:       response.Profile.Username,
			Bio:            response.Profile.Bio,
			Avatar:         response.Profile.Avatar,
			AvatarBg:       response.Profile.AvatarBg,
			BannerColor:    response.Profile.BannerColor,
			StatusActivity: response.Profile.StatusActivity,
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

func (a Handler) ChangeUsernameHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	request := new(dto.ChangeUsernameRequest)
	c.BodyParser(request)

	if err := a.Validate.Struct(request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	c.FormFile("")

	err := a.AuthController.NewUsername(user_id, request.Username, request.Password)
	if err != nil {
		if errors.Is(err, errs.ErrPasswordNotMatch) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
				Message: "validation failed",
				Data: map[string]string{
					"password": err.Error(),
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

		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "something error",
			Data:    err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "update username success",
	})
}

func (a Handler) UpdateProfileHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	request := new(dto.UpdateProfileRequest)
	c.BodyParser(request)

	// if err := a.Validate.Struct(request); err != nil {
	// 	return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
	// 		Message: "validation failed",
	// 		Data:    helper.ValidationMsg(err),
	// 	})
	// }

	name := c.FormValue("name")
	bannerColor := c.FormValue("banner_color")
	bio := c.FormValue("bio")
	avatar, err := c.FormFile("avatar")

	request.Name = name
	request.BannerColor = bannerColor
	request.Bio = bio

	if err != nil {
		if err := a.AuthController.UpdateProfile(user_id, *request, ""); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: "something error",
			})
		}

		return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
			Message: "update profile success",
			Data: fiber.Map{
				"name":         name,
				"banner_color": bannerColor,
				"bio":          bio,
				"avatar":       "",
			},
		})

	}

	uploadDir := "./public"

	os.MkdirAll(uploadDir, os.ModePerm)
	ext := filepath.Ext(avatar.Filename)
	newFileName := user_id + ext
	filePath := filepath.Join(uploadDir, newFileName)
	c.SaveFile(avatar, filePath)

	request.Avatar = avatar
	request.Avatar.Filename = newFileName

	if err := a.AuthController.UpdateProfile(user_id, *request, newFileName); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "something error",
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "update profile success",
		Data: fiber.Map{
			"name":         name,
			"banner_color": bannerColor,
			"bio":          bio,
			"avatar":       newFileName,
		},
	})
}

func (a Handler) Upload(c *fiber.Ctx) error {

	request := new(dto.UpdateProfileRequest)
	c.BodyParser(request)

	if err := a.Validate.Struct(request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[string]{
			Message: "lol",
			Data:    err.Error(),
		})
	}

	request.Avatar = file

	if file != nil {
		// Tentukan folder
		uploadDir := "./public"

		// Buat folder kalau belum ada
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			log.Println("failed create dir:", err)
			return err
		}

		// Ambil ekstensi file asli (.jpg, .png, dll)
		ext := filepath.Ext(file.Filename)

		// Generate filename pakai timestamp (nanosecond supaya benar-benar unik)
		newFileName := time.Now().Format("20060102150405") + ext
		// Format: YYYYMMDDHHMMSS.ext

		// Kalau mau lebih aman pakai nano + random:
		// newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)

		filePath := filepath.Join(uploadDir, newFileName)

		// Simpan file
		if err := c.SaveFile(file, filePath); err != nil {
			log.Println("failed save file:", err)
			return err
		}

		return c.JSON(fiber.Map{
			"message": "Profile updated",
			"avatar":  newFileName,
		})
	}

	return c.JSON(fiber.Map{
		"message": "Profile updated",
		"data": fiber.Map{
			"avatar": file,
			"s":      request.Avatar,
		},
	})
}
