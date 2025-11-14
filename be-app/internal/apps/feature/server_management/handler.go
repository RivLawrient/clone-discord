package servermanagement

import (
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
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
	code := c.Params("code")

	response, err := h.Service.GetServerByCode(code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	var count int
	for _, v := range response.JoinServer {
		if v.User.UserProfile.StatusActivity == "Invisible" {
			count++
		}
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ServerInvite]{
		Message: "success get data",
		// Data:    response,
		Data: dto.ServerInvite{
			ID:           response.ID,
			Name:         response.Name,
			ProfileImage: response.ProfileImage,
			TotalOnline:  count,
			TotalMember:  len(response.JoinServer),
		},
	})
}

func (h *Handler) CreateCategoryChannelHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	request := new(dto.CreateCategoryChannelRequest)
	c.BodyParser(request)

	if err := h.Validate.Struct(request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	data, err := h.Service.CreateCategoryChannel(userID, request.ServerId, request.Name)
	if err != nil {
		if errors.Is(err, errs.ErrNotOwnerServer) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: errs.ErrIDNotFound.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
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

func (h *Handler) DeleteCategoryChannelHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	categoryID := c.Params("category_id")

	if err := h.Validate.Var(categoryID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	data, err := h.Service.DeleteCategoryChannel(userID, categoryID)
	if err != nil {
		if errors.Is(err, errs.ErrNotOwnerServer) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: errs.ErrChannelCategoryNotFound.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
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

func (h *Handler) CreateChannelHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	req := new(dto.CreateChannelRequest)
	c.BodyParser(req)

	if err := h.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	data, err := h.Service.CreateChannel(userID, req.ServerId, req.CategoryId, req.Name, req.IsVoice)
	if err != nil {
		if errors.Is(err, errs.ErrNotOwnerServer) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: errs.ErrChannelCategoryNotFound.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ChannelList]{
		Message: "success delete category channel",
		Data: dto.ChannelList{
			ID:       data.ID,
			Name:     data.Name,
			IsVoice:  data.IsVoice,
			Position: data.Position,
		},
	})
}

func (h *Handler) DeleteChannelHandler(c *fiber.Ctx) error {

	userID := c.Locals("user_id").(string)
	channelID := c.Params("channel_id")
	req := new(dto.DeleteChannelRequest)
	c.BodyParser(req)

	if err := h.Validate.Var(channelID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	if err := h.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	data, err := h.Service.DeleteChannel(userID, channelID, req.CategoryId)
	if err != nil {
		if errors.Is(err, errs.ErrNotOwnerServer) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: errs.ErrIDNotFound.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
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

func (h *Handler) GetListChannelAndCategoryServerHandler(c *fiber.Ctx) error {
	serverID := c.Params("server_id")

	server, channels, categories, err := h.Service.GetListChannelAndCategoryServer(serverID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: errs.ErrIDNotFound.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	channelList := []dto.ChannelList{}
	for _, v := range *channels {
		if v.ChannelCategoryID == nil {
			channelList = append(channelList, dto.ChannelList{
				ID:       v.ID,
				Name:     v.Name,
				IsVoice:  v.IsVoice,
				Position: v.Position,
			})
		}
	}

	catList := []dto.CategoryChannel{}
	for _, v := range *categories {
		chList := []dto.ChannelList{}
		for _, vv := range v.Channel {
			chList = append(chList, dto.ChannelList{
				ID:       vv.ID,
				Name:     vv.Name,
				IsVoice:  vv.IsVoice,
				Position: vv.Position,
			})
		}

		catList = append(catList, dto.CategoryChannel{
			ID:       v.ID,
			Name:     v.Name,
			Position: v.Position,
			Channel:  chList,
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ChannelCategory]{
		Message: "success delete category channel",
		Data: dto.ChannelCategory{
			ServerId: server.ID,
			Channel:  channelList,
			Category: catList,
		},
	})
}

func (h *Handler) GetListChannelAndCategoryUserHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	data, err := h.Service.GetListChannelAndCategoryUser(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[[]dto.ChannelCategory]{
		Message: "success delete category channel",
		Data:    *data,
	})
}
