package servermanagement

import (
	"be-app/internal/apps/websocket"
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
	Hub      *websocket.Hub
}

func NewHandler(service Service, validate validator.Validate, hub *websocket.Hub) *Handler {
	return &Handler{
		Service:  service,
		Validate: validate,
		Hub:      hub,
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

	resp, _ := h.Service.GetListChannelAndCategoryServer(request.ServerId)
	ids := h.Service.Get_listUserIDInServer(request.ServerId)
	h.Hub.SendToUser(*ids, resp)

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
	resp, _ := h.Service.GetListChannelAndCategoryServer(data.ServerID)
	ids := h.Service.Get_listUserIDInServer(data.ServerID)
	h.Hub.SendToUser(*ids, resp)

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

	resp, _ := h.Service.GetListChannelAndCategoryServer(data.ServerID)
	ids := h.Service.Get_listUserIDInServer(data.ServerID)
	h.Hub.SendToUser(*ids, resp)

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

	resp, _ := h.Service.GetListChannelAndCategoryServer(data.ServerID)
	ids := h.Service.Get_listUserIDInServer(data.ServerID)
	h.Hub.SendToUser(*ids, resp)

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

	data, err := h.Service.GetListChannelAndCategoryServer(serverID)
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

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ChannelCategory]{
		Message: "success get list channel",
		Data:    *data,
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
		Message: "success get list category channel",
		Data:    *data,
	})
}

func (h *Handler) ReorderChannelHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	serverID := c.Params("server_id")
	request := new(dto.ReorderChannelRequest)
	c.BodyParser(request)

	if err := h.Validate.Var(serverID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	data, err := h.Service.ReorderChannel(userID, serverID, *request)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: errs.ErrIDNotFound.Error(),
			})
		}
		if errors.Is(err, errs.ErrNotOwnerServer) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	resp, _ := h.Service.GetListChannelAndCategoryServer(serverID)
	ids := h.Service.Get_listUserIDInServer(serverID)
	h.Hub.SendToUser(*ids, resp)

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ChannelCategory]{
		Message: "success reorder channel",
		Data:    *data,
	})
}

func (h *Handler) UpdateProfileHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	serverID := c.Params("server_id")
	req := new(dto.NewServerRequest)
	c.BodyParser(req)

	if err := h.Validate.Var(serverID, "uuid"); err != nil {
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

	result, err := h.Service.UpdateProfile(userID, serverID, req.Name, imageID)
	if err != nil {
		if errors.Is(err, errs.ErrNotOwnerServer) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	ids := h.Service.Get_listUserIDInServer(serverID)
	h.Hub.SendToUser(*ids, fiber.Map{
		"server_id": serverID,
		"data": dto.ServerList{
			Name:         result.Name,
			ProfileImage: result.ProfileImage,
		},
	})

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ServerList]{
		Message: "success update profile",
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

func (h *Handler) DeleteServerHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	serverID := c.Params("server_id")

	if err := h.Validate.Var(serverID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	ids := h.Service.Get_listUserIDInServer(serverID)
	_, err := h.Service.DeleteServer(userID, serverID)
	if err != nil {
		if errors.Is(err, errs.ErrNotOwnerServer) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	h.Hub.SendToUser(*ids, fiber.Map{
		"server_id": serverID,
		"is_delete": true,
	})

	// resp := []dto.ServerList{}
	// for _, v := range *data {
	// 	each := dto.ServerList{
	// 		ID:           v.Server.ID,
	// 		Name:         v.Server.Name,
	// 		ProfileImage: v.Server.ProfileImage,
	// 		InviteCode:   v.Server.InviteCode,
	// 		Position:     v.Position,
	// 		IsOwner:      v.IsOwner,
	// 	}

	// 	resp = append(resp, each)
	// }

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success delete server",
	})
}

func (h *Handler) GetListMemberServerHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	serverID := c.Params("server_id")

	if err := h.Validate.Var(serverID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	data, err := h.Service.GetListMemberServer(userID, serverID)
	if err != nil {
		if errors.Is(err, errs.ErrNotJoinServer) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	resp := []dto.ServerMember{}
	for _, v := range *data {
		resp = append(resp, dto.ServerMember{
			UserID:         v.UserID,
			Name:           v.Name,
			Username:       v.Username,
			Avatar:         v.Avatar,
			AvatarBg:       v.AvatarBg,
			StatusActivity: v.StatusActivity,
			Bio:            v.Bio,
			BannerColor:    v.BannerColor,
		})
	}
	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[[]dto.ServerMember]{
		Message: "success get data",
		Data:    resp,
	})
}
