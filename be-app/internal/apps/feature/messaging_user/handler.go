package messaginguser

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
	otherUserID := c.Params("user_id")
	req := new(dto.TextMessageRequest)
	c.BodyParser(req)

	if err := h.Validate.Var(otherUserID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	if err := h.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	data, err := h.Service.AddTextMsg(userID, otherUserID, req.Text)
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

	dm, _ := h.Service.ListDM(otherUserID)
	list := []dto.UserOther{}
	for _, v := range *dm {
		list = append(list, dto.UserOther{
			UserId:         v.UserID,
			Name:           v.Name,
			Username:       v.Username,
			Avatar:         v.Avatar,
			AvatarBg:       v.AvatarBg,
			StatusActivity: v.StatusActivity,
			Bio:            v.Bio,
			BannerColor:    v.BannerColor,
		})
	}
	h.Hub.SendToUser([]string{otherUserID}, fiber.Map{
		"dm_list": list,
	})

	dm2, _ := h.Service.ListDM(userID)
	list2 := []dto.UserOther{}
	for _, v := range *dm2 {
		list2 = append(list2, dto.UserOther{
			UserId:         v.UserID,
			Name:           v.Name,
			Username:       v.Username,
			Avatar:         v.Avatar,
			AvatarBg:       v.AvatarBg,
			StatusActivity: v.StatusActivity,
			Bio:            v.Bio,
			BannerColor:    v.BannerColor,
		})
	}
	h.Hub.SendToUser([]string{userID}, fiber.Map{
		"dm_list": list2,
	})

	resp := dto.MessageUser{
		ID: data.ID,
		User: dto.UserOther{
			UserId:         data.Sender.ID,
			Name:           data.Sender.UserProfile.Name,
			Username:       data.Sender.UserProfile.Username,
			Avatar:         data.Sender.UserProfile.Avatar,
			AvatarBg:       data.Sender.UserProfile.AvatarBg,
			StatusActivity: data.Sender.UserProfile.StatusActivity,
			Bio:            data.Sender.UserProfile.Bio,
			BannerColor:    data.Sender.UserProfile.BannerColor,
		},
		Text:      data.Text,
		CreatedAt: data.CreatedAt,
	}

	h.Hub.SendToUser([]string{data.ReceiverID, data.SenderID}, fiber.Map{
		"dm_sender": data.Sender.UserProfile.Username,
		"data":      resp,
	})

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.MessageUser]{
		Message: "success send text chat",
		Data:    resp,
	})
}

func (h *Handler) GetListTextMsgHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	otherUserID := c.Params("user_id") // Pastikan validasi channel_id wajib ada
	limitStr := c.Query("limit")
	beforeID := c.Query("before_id")

	if err := h.Validate.Var(otherUserID, "uuid"); err != nil {
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

	data, err := h.Service.GetListTextMsg(userID, otherUserID, beforeID, limit)
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

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[[]dto.MessageUser]{
		Message: "success get message",
		Data:    *data,
	})
}

func (h *Handler) EditTextMsgHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	chatID := c.Params("chat_id")
	req := new(dto.TextMessageRequest)

	c.BodyParser(req)
	if err := h.Validate.Var(chatID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	if err := h.Validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	data, id, err := h.Service.EditTextMsg(userID, chatID, req.Text)
	if err != nil {
		if errors.Is(err, errs.ErrIDNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		if errors.Is(err, errs.ErrNotOwnerMessage) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	h.Hub.SendToUser([]string{userID, *id}, fiber.Map{
		"chat_edited": data.User.Username,
		"data":        data,
	})

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.MessageUser]{
		Message: "success edit text chat",
		Data:    *data,
	})
}

func (h *Handler) RemoveTextMsgHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	chatID := c.Params("chat_id")

	if err := h.Validate.Var(chatID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	data, err := h.Service.RemoveTextMsg(userID, chatID)
	if err != nil {
		if errors.Is(err, errs.ErrIDNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: errs.ErrIDNotFound.Error(),
			})
		}

		if errors.Is(err, errs.ErrNotOwnerMessage) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	dm, _ := h.Service.ListDM(data.ReceiverID)
	list := []dto.UserOther{}
	for _, v := range *dm {
		list = append(list, dto.UserOther{
			UserId:         v.UserID,
			Name:           v.Name,
			Username:       v.Username,
			Avatar:         v.Avatar,
			AvatarBg:       v.AvatarBg,
			StatusActivity: v.StatusActivity,
			Bio:            v.Bio,
			BannerColor:    v.BannerColor,
		})
	}
	h.Hub.SendToUser([]string{data.ReceiverID}, fiber.Map{
		"dm_list": list,
	})

	dm2, _ := h.Service.ListDM(userID)
	list2 := []dto.UserOther{}
	for _, v := range *dm2 {
		list2 = append(list2, dto.UserOther{
			UserId:         v.UserID,
			Name:           v.Name,
			Username:       v.Username,
			Avatar:         v.Avatar,
			AvatarBg:       v.AvatarBg,
			StatusActivity: v.StatusActivity,
			Bio:            v.Bio,
			BannerColor:    v.BannerColor,
		})
	}
	h.Hub.SendToUser([]string{userID}, fiber.Map{
		"dm_list": list2,
	})

	resp := dto.MessageUser{
		ID: data.ID,
		User: dto.UserOther{
			UserId:         data.Sender.ID,
			Name:           data.Sender.UserProfile.Name,
			Username:       data.Sender.UserProfile.Username,
			Avatar:         data.Sender.UserProfile.Avatar,
			AvatarBg:       data.Sender.UserProfile.AvatarBg,
			StatusActivity: data.Sender.UserProfile.StatusActivity,
			Bio:            data.Sender.UserProfile.Bio,
			BannerColor:    data.Sender.UserProfile.BannerColor,
		},
		Text:      data.Text,
		CreatedAt: data.CreatedAt,
	}

	h.Hub.SendToUser([]string{data.ReceiverID, data.SenderID}, fiber.Map{
		"chat_deleted": data.Sender.UserProfile.Username,
		"data":         resp,
	})

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.MessageUser]{
		Message: "success delete chat",
		Data:    resp,
	})
}

func (h *Handler) ListDMHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	data, err := h.Service.ListDM(userID)
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

	list := []dto.UserOther{}
	for _, v := range *data {
		list = append(list, dto.UserOther{
			UserId:         v.UserID,
			Name:           v.Name,
			Username:       v.Username,
			Avatar:         v.Avatar,
			AvatarBg:       v.AvatarBg,
			StatusActivity: v.StatusActivity,
			Bio:            v.Bio,
			BannerColor:    v.BannerColor,
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[[]dto.UserOther]{
		Message: "success get dm",
		Data:    list,
	})
}
