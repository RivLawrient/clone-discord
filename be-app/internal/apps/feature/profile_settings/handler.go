package profilesettings

import (
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"errors"
	"os"
	"path/filepath"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct {
	Service  *Service
	Validate validator.Validate
}

func NewHandler(service *Service, validate validator.Validate) *Handler {
	return &Handler{
		Service:  service,
		Validate: validate,
	}
}

func (h *Handler) NewUsernameHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	req := new(dto.ChangeUsernameRequest)
	c.BodyParser(req)

	if err := h.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	err := h.Service.NewUsername(userID, req.Username, req.Password)
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
			Data:    errs.ErrInternal.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "update username success",
	})
}

func (h *Handler) UpdateProfileHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	req := new(dto.UpdateProfileRequest)
	c.BodyParser(req)

	// if err := a.Validate.Struct(request); err != nil {
	// 	return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
	// 		Message: "validation failed",
	// 		Data:    helper.ValidationMsg(err),
	// 	})
	// }

	name := c.FormValue("name")                //wajib
	bannerColor := c.FormValue("banner_color") //wajib
	bio := c.FormValue("bio")                  //wajib
	avatar, err := c.FormFile("avatar")

	req.Name = name
	req.BannerColor = bannerColor
	req.Bio = bio

	if err != nil {
		avtr := h.Service.GetAvatar(userID)
		if err := h.Service.UpdateProfile(userID, *req, avtr); err != nil {
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
				"avatar":       avtr,
			},
		})

	}

	if avatar.Size == 0 {
		//hapus
		if err := h.Service.UpdateProfile(userID, *req, ""); err != nil {
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
	newFileName := uuid.NewString() + ext
	filePath := filepath.Join(uploadDir, newFileName)
	c.SaveFile(avatar, filePath)

	req.Avatar = avatar
	req.Avatar.Filename = newFileName

	if err := h.Service.UpdateProfile(userID, *req, newFileName); err != nil {
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

func (h *Handler) GetProfileHandler(c *fiber.Ctx) error {
	username := c.Params("username")

	data, err := h.Service.GetProfile(username)
	if err != nil {
		if errors.Is(err, errs.ErrIDNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: errs.ErrIDNotFound.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.UserOther]{
		Message: "get profile success",
		Data: dto.UserOther{
			UserId:         data.UserID,
			Name:           data.Name,
			Username:       username,
			Avatar:         data.Avatar,
			AvatarBg:       data.AvatarBg,
			StatusActivity: data.StatusActivity,
			Bio:            data.Bio,
			BannerColor:    data.BannerColor,
		},
	})
}
