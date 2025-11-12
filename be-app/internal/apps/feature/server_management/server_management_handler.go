package servermanagement

import (
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"log"
	"os"
	"path/filepath"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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

func (h *Handler) CreateNewServerHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	req := new(dto.NewServerRequest)
	c.BodyParser(req)
	if err := h.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	file, _ := c.FormFile("profile_image")
	req.ProfileImage = file
	var imageID = ""
	// kalau ada image langsung simpan
	if req.ProfileImage != nil {
		upload_dir := "./public"
		if err := os.MkdirAll(upload_dir, os.ModePerm); err != nil {
			log.Println("failed create dir:", err)
			return err
		}

		ext := filepath.Ext(req.ProfileImage.Filename)
		new_name := uuid.NewString() + ext
		file_path := filepath.Join(upload_dir, new_name)
		if err := c.SaveFile(req.ProfileImage, file_path); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: "something wrong",
				Data:    err.Error(),
			})
		}

		imageID = new_name
	}

	result, err := h.Service.CreateNewServer(userID, req.Name, imageID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ServerList]{
		Message: "success create server",
		Data: dto.ServerList{
			ID:           result.ID,
			Name:         result.Name,
			ProfileImage: result.ProfileImage,
			InviteCode:   result.InviteCode,
			Position:     result.JoinServer[0].Position,
			IsOwner:      result.JoinServer[0].IsOwner,
		},
	})
}

func (h *Handler) GetServerByCodeHandler(c *fiber.Ctx) error {
	// userID := c.Locals("user_id").(string)
	code := c.Params("code")

	response, err := h.Service.GetServerByCode(code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	// var count int
	// for _, v := range response.JoinServer {
	// 	if v.User.UserProfile.StatusActivity == "Invisible" {
	// 		count++
	// 	}
	// }

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success get data",
		Data:    response,
		// Data: dto.ServerInvite{
		// 	ID:           response.ID,
		// 	Name:         response.Name,
		// 	ProfileImage: response.ProfileImage,
		// 	TotalOnline:  count,
		// 	TotalMember:  len(response.JoinServer),
		// },
	})
}
