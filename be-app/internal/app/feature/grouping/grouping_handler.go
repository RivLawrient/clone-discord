package grouping

import (
	"be-app/internal/dto"
	"be-app/internal/helper"
	"log"
	"os"
	"path/filepath"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct {
	Controller Controller
	Validate   validator.Validate
}

func NewHandler(controller Controller, validate validator.Validate) Handler {
	return Handler{
		Controller: controller,
		Validate:   validate,
	}
}

func (h Handler) CreateServerHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	request := new(dto.NewServerRequest)
	c.BodyParser(request)
	if err := h.Validate.Struct(request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}
	file, _ := c.FormFile("profile_image")
	log.Println(file)

	request.ProfileImage = file
	var image_id = ""
	// kalau ada image langsung simpan
	log.Println(request.ProfileImage)
	if request.ProfileImage != nil {
		upload_dir := "./public"
		if err := os.MkdirAll(upload_dir, os.ModePerm); err != nil {
			log.Println("failed create dir:", err)
			return err
		}

		ext := filepath.Ext(request.ProfileImage.Filename)
		new_name := uuid.NewString() + ext
		file_path := filepath.Join(upload_dir, new_name)
		if err := c.SaveFile(request.ProfileImage, file_path); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: "something wrong",
				Data:    err.Error(),
			})
		}

		image_id = new_name
	}

	result, err := h.Controller.CreateServer(user_id, request.Name, image_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "something wrong",
			Data:    err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ServerList]{
		Message: "success create server",
		Data:    *result,
	})
}

func (h Handler) GenerateFiveServerHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)

	if err := h.Controller.GenerateFiveServer(user_id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success send text chat",
		Data:    "success",
	})
}

func (h Handler) GetJoinServerHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	data, err := h.Controller.GetJoinServer(user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success send text chat",
		Data:    data,
	})
}

func (h Handler) UpdatePositionServerHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	id := c.Params("id")
	positionStr := c.Params("position")

	position, err := strconv.Atoi(positionStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "invalid position parameter",
		})
	}

	data, err := h.Controller.UpdateJoinServerPosition(user_id, id, position)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})

	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success send text chat",
		Data:    data,
	})
}
