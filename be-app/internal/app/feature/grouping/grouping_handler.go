package grouping

import (
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"errors"
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

func (h Handler) GetServerByCodeHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	code := c.Params("code")

	data, err := h.Controller.GetServerByCode(user_id, code)
	if err != nil {
		if errors.Is(err, errs.ErrServerNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		if errors.Is(err, errs.ErrAlreadyJoinServer) {
			// c.Redirect("/channels/" + data.ID)
			return c.Status(fiber.StatusConflict).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
				Data: fiber.Map{
					"redirect": "/channels/" + data.ID,
				},
			})
		}

		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success get server",
		Data:    data,
	})
}

func (h Handler) JoinServerHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	server_id := c.Params("server_id")

	data, err := h.Controller.JoinServer(user_id, server_id)
	if err != nil {
		if errors.Is(err, errs.ErrAlreadyJoinServer) {
			return c.Status(fiber.StatusConflict).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
				Data: fiber.Map{
					"redirect": "/channels/" + data.ID,
				},
			})
		}

		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success join server",
		Data:    data,
	})
}

func (h Handler) CreateCategoryChannelHandler(c *fiber.Ctx) error {
	userId := c.Locals("user_id").(string)
	request := new(dto.CreateCategoryChannelRequest)
	c.BodyParser(request)

	if err := h.Validate.Struct(request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	data, err := h.Controller.CreateCategoryChannel(userId, request.ServerId, request.Name)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.CategoryChannel]{
		Message: "success create category channel",
		Data: dto.CategoryChannel{
			ID:       data.ID,
			Name:     data.Name,
			Position: data.Position,
			Channel:  []dto.ChannelList{},
		},
	})
}

func (h Handler) DeleteCategoryChannelHandler(c *fiber.Ctx) error {
	userId := c.Locals("user_id").(string)
	cateogryId := c.Params("category_id")

	data, err := h.Controller.DeleteCategoryChannel(userId, cateogryId)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.CategoryChannel]{
		Message: "success delete category channel",
		Data: dto.CategoryChannel{
			ID:       data.ID,
			Name:     data.Name,
			Position: data.Position,
			Channel:  []dto.ChannelList{},
		},
	})
}

func (h Handler) CreateChannelHandler(c *fiber.Ctx) error {
	userId := c.Locals("user_id").(string)
	request := new(dto.CreateChannelRequest)
	c.BodyParser(request)

	if err := h.Validate.Struct(request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	data, err := h.Controller.CreateChannel(userId, request.ServerId, request.Name, request.IsVoice, request.CategoryId)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ChannelList]{
		Message: "success create channel",
		Data: dto.ChannelList{
			ID:       data.ID,
			Name:     data.Name,
			IsVoice:  data.IsVoice,
			Position: data.Position,
		},
	})
}

func (h Handler) DeleteChannelHandler(c *fiber.Ctx) error {
	userId := c.Locals("user_id").(string)
	channel_id := c.Params("channel_id")

	data, err := h.Controller.DeleteChannel(userId, channel_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ChannelList]{
		Message: "success delete channel",
		Data: dto.ChannelList{
			ID:       data.ID,
			Name:     data.Name,
			IsVoice:  data.IsVoice,
			Position: data.Position,
		},
	})
}

func (h Handler) GetChannelAndCategoryHandler(c *fiber.Ctx) error {
	serverId := c.Params("server_id")

	data, err := h.Controller.GetChannelAndCategory(serverId)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ChannelCategory]{
		Message: "success delete category channel",
		Data:    *data,
	})
}

func (h Handler) ReorderChannelHandler(c *fiber.Ctx) error {
	userId := c.Locals("user_id").(string)
	serverId := c.Params("server_id")
	request := new(dto.ReorderChannelRequest)
	c.BodyParser(request)

	_, err := h.Controller.ReorderChannel(userId, serverId, *request)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ChannelCategory]{
		Message: "success delete category channel",
		// Data:    *data,
	})
}
