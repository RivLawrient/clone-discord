package messagingchannel

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

func (h *Handler) AddTextMsgHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	channelID := c.Params("channel_id")
	request := new(dto.TextMessageRequest)
	c.BodyParser(request)

	if err := h.Validate.Var(channelID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	data, profile, list, err := h.Service.AddTextMsg(userID, channelID, request.Text)
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

	resp := dto.MessageChannel{
		ID: data.ID,
		User: dto.UserOther{
			UserId:         profile.UserID,
			Name:           profile.Name,
			Username:       profile.Username,
			Avatar:         profile.Avatar,
			AvatarBg:       profile.AvatarBg,
			StatusActivity: profile.StatusActivity,
			Bio:            profile.Bio,
			BannerColor:    profile.BannerColor,
		},
		Text:      data.Text,
		CreatedAt: data.CreatedAt,
	}

	h.Hub.SendToUser(*list, dto.MessageChannelSocket{
		ChannelId:      data.ChannelID,
		MessageChannel: resp,
	})

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.MessageChannel]{
		Message: "success send text chat",
		Data:    resp,
	})
}

func (h *Handler) GetListTextMsgHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	channelID := c.Params("channel_id") // Pastikan validasi channel_id wajib ada
	limitStr := c.Query("limit")
	beforeID := c.Query("before_id")

	if err := h.Validate.Var(channelID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params channel_id%s", helper.ValidationMsg(err)[""]),
		})
	}

	if err := h.Validate.Var(limitStr, "numeric"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("query limit%s", helper.ValidationMsg(err)[""]),
		})
	}

	if beforeID != "" {
		if err := h.Validate.Var(beforeID, "uuid"); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: "validation failed",
				Data:    fmt.Sprintf("query before_id%s", helper.ValidationMsg(err)[""]),
			})
		}
	}

	limit, _ := strconv.Atoi(limitStr)

	data, err := h.Service.GetListTextMsg(userID, channelID, beforeID, limit)
	if err != nil {
		if errors.Is(err, errs.ErrIDNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[[]dto.MessageChannel]{
		Message: "success get message",
		Data:    *data,
	})
}
