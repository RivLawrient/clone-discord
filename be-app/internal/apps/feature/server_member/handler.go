package servermember

import (
	"be-app/internal/apps/websocket"
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"errors"
	"fmt"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
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

func (h *Handler) GetListServerHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	response, err := h.Service.GetListServer(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	// var responses []dto.ServerListResponse
	responses := []dto.ServerListResponse{}
	for _, join := range *response {
		responses = append(responses, dto.ServerListResponse{
			ID:           join.Server.ID,
			Name:         join.Server.Name,
			ProfileImage: join.Server.ProfileImage,
			InviteCode:   join.Server.InviteCode,
			Position:     join.Position,
			IsOwner:      join.IsOwner,
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[[]dto.ServerListResponse]{
		Message: "success get data",
		Data:    responses,
	})
}

func (h *Handler) UpdateServerPositionHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	serverID := c.Params("server_id")
	newPosition := c.Params("new_position")

	if err := h.Validate.Var(serverID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	position, _ := strconv.Atoi(newPosition)
	response, err := h.Service.UpdateServerPosition(userID, serverID, position)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	var responses []dto.ServerListResponse
	for _, join := range response {
		responses = append(responses, dto.ServerListResponse{
			ID:           join.Server.ID,
			Name:         join.Server.Name,
			ProfileImage: join.Server.ProfileImage,
			InviteCode:   join.Server.InviteCode,
			Position:     join.Position,
			IsOwner:      join.IsOwner,
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[[]dto.ServerListResponse]{
		Message: "success update position server",
		Data:    responses,
	})
}

func (h *Handler) JoinServerHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	serverID := c.Params("server_id")

	data, ids, profile, err := h.Service.JoinServer(userID, serverID)
	if err != nil {
		if errors.Is(err, errs.ErrAlreadyJoinServer) {
			return c.Status(fiber.StatusConflict).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
				Data: fiber.Map{
					"redirect": "/channels/" + data.ServerID,
				},
			})
		}

		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	h.Hub.SendToUser(*ids, fiber.Map{
		"server_id": serverID,
		"new_member": dto.ServerMember{
			UserID:         profile.UserID,
			Name:           profile.Name,
			Username:       profile.Username,
			Avatar:         profile.Avatar,
			AvatarBg:       profile.AvatarBg,
			StatusActivity: profile.StatusActivity,
			Bio:            profile.Bio,
			BannerColor:    profile.BannerColor,
		},
	})
	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ServerList]{
		Message: "success join server",
		Data: dto.ServerList{
			ID:           data.Server.ID,
			Name:         data.Server.Name,
			ProfileImage: data.Server.ProfileImage,
			InviteCode:   data.Server.InviteCode,
			Position:     data.Position,
			IsOwner:      data.IsOwner,
		},
	})
}

func (h *Handler) LeaveServerHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	serverID := c.Params("server_id")

	if err := h.Validate.Var(serverID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	data, ids, profile, err := h.Service.LeaveServer(userID, serverID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})

	}

	h.Hub.SendToUser(*ids, fiber.Map{
		"server_id": serverID,
		"leave_member": dto.ServerMember{
			UserID:         profile.UserID,
			Name:           profile.Name,
			Username:       profile.Username,
			Avatar:         profile.Avatar,
			AvatarBg:       profile.AvatarBg,
			StatusActivity: profile.StatusActivity,
			Bio:            profile.Bio,
			BannerColor:    profile.BannerColor,
		},
	})
	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.ServerList]{
		Message: "success leave server",
		Data: dto.ServerList{
			ID:           data.Server.ID,
			Name:         data.Server.Name,
			ProfileImage: data.Server.ProfileImage,
			InviteCode:   data.Server.InviteCode,
			Position:     data.Position,
			IsOwner:      data.IsOwner,
		},
	})

}
