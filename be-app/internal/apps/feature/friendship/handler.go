package friendship

import (
	"be-app/internal/apps/websocket"
	"be-app/internal/dto"
	"be-app/internal/errs"
	"be-app/internal/helper"
	"errors"
	"fmt"

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

func (h *Handler) NewRequestFriendHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	username := c.Params("username")

	data, err := h.Service.NewRequestFriend(userID, username)
	if err != nil {
		if errors.Is(err, errs.ErrUserNotFound) || errors.Is(err, errs.ErrFriendAdded) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	me, _ := h.Service.GetListAll(userID)
	h.Hub.SendToUser([]string{userID}, me)
	to, _ := h.Service.GetListAll(data.ReceiverID)
	h.Hub.SendToUser([]string{data.ReceiverID}, to)

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.FriendList]{
		Message: "success send request",
		Data:    dto.FriendList{},
	})
}

func (h *Handler) GetListAllHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	data, err := h.Service.GetListAll(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.GroupFriendList]{
		Message: "success get data",
		Data:    *data,
	})
}

func (h *Handler) AcceptRequestHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	otherUserID := c.Params("user_id")

	if err := h.Validate.Var(otherUserID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	if err := h.Service.AcceptRequest(userID, otherUserID); err != nil {

		if errors.Is(err, errs.ErrRequestFriendNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	me, _ := h.Service.GetListAll(userID)
	h.Hub.SendToUser([]string{userID}, me)
	to, _ := h.Service.GetListAll(otherUserID)
	h.Hub.SendToUser([]string{otherUserID}, to)

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success accept request",
	})
}

func (h *Handler) DeclineRequestHandler(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	otherUserID := c.Params("user_id")

	if err := h.Validate.Var(otherUserID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	if err := h.Service.DeclineRequest(userID, otherUserID); err != nil {
		if errors.Is(err, errs.ErrRequestFriendNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	me, _ := h.Service.GetListAll(userID)
	h.Hub.SendToUser([]string{userID}, me)
	to, _ := h.Service.GetListAll(otherUserID)
	h.Hub.SendToUser([]string{otherUserID}, to)

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success decline request",
	})
}

func (h *Handler) RemoveFriendHanlder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	otherUserID := c.Params("user_id")

	if err := h.Validate.Var(otherUserID, "uuid"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    fmt.Sprintf("params%s", helper.ValidationMsg(err)[""]),
		})
	}

	if err := h.Service.RemoveFriend(userID, otherUserID); err != nil {
		if errors.Is(err, errs.ErrRequestFriendNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
			Message: errs.ErrInternal.Error(),
		})
	}

	me, _ := h.Service.GetListAll(userID)
	h.Hub.SendToUser([]string{userID}, me)
	to, _ := h.Service.GetListAll(otherUserID)
	h.Hub.SendToUser([]string{otherUserID}, to)

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success remove friend",
	})
}
