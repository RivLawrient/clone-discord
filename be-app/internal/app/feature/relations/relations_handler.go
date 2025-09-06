package relations

import (
	"be-app/internal/app/domain/friend"
	"be-app/internal/app/feature/hub"
	"be-app/internal/dto"
	"be-app/internal/errs"
	"encoding/json"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Validate            validator.Validate
	RealtionsController Controller
	HubController       *hub.Controller
}

func NewHandler(validate validator.Validate, relationsController Controller, hub *hub.Controller) Handler {
	return Handler{
		Validate:            validate,
		RealtionsController: relationsController,
		HubController:       hub,
	}
}

func (h *Handler) AddFriendHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	username := c.Params("username")

	response, err := h.RealtionsController.NewRequestFriend(username, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	sent, err := h.RealtionsController.ListSentRelations(user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}
	sentJson, _ := json.Marshal(fiber.Map{
		"sent": sent,
	})
	h.HubController.SendToUser(user_id, sentJson)

	request, err := h.RealtionsController.ListReqRelations(response.ReceiverId)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}
	reqJson, _ := json.Marshal(fiber.Map{
		"request": request,
	})
	h.HubController.SendToUser(response.ReceiverId, reqJson)

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[friend.Friend]{
		Message: "success send request",
		Data:    *response,
	})
}

func (h *Handler) GetListFriendHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)

	data, err := h.RealtionsController.ListRelations(user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.GroupFriendList]{
		Message: "success get list",
		Data:    *data,
	})
}

func (h *Handler) CancelSentFriendHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	id := c.Params("user_id")

	err := h.RealtionsController.DeleteRelation(user_id, id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	sent_list, _ := h.RealtionsController.ListSentRelations(user_id)
	sent_json, _ := json.Marshal(fiber.Map{
		"sent": sent_list,
	})
	h.HubController.SendToUser(user_id, sent_json)

	req_list, _ := h.RealtionsController.ListReqRelations(id)
	req_json, _ := json.Marshal(fiber.Map{
		"request": req_list,
	})
	h.HubController.SendToUser(id, req_json)

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success cancel request",
	})
}

func (h *Handler) DeclineRequestFriendHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	id := c.Params("user_id")

	err := h.RealtionsController.DeleteRelation(user_id, id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	req_list, _ := h.RealtionsController.ListReqRelations(user_id)
	req_json, _ := json.Marshal(fiber.Map{
		"request": req_list,
	})
	h.HubController.SendToUser(user_id, req_json)

	sent_list, _ := h.RealtionsController.ListSentRelations(id)
	sent_json, _ := json.Marshal(fiber.Map{
		"sent": sent_list,
	})
	h.HubController.SendToUser(id, sent_json)

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success decline request",
	})
}

func (h *Handler) AcceptRequestFriendHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	id := c.Params("user_id")

	err := h.RealtionsController.AcceptRequest(id, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	me_list, _ := h.RealtionsController.ListRelations(user_id)
	me_json, _ := json.Marshal(me_list)
	h.HubController.SendToUser(user_id, me_json)

	other_list, _ := h.RealtionsController.ListRelations(id)
	other_json, _ := json.Marshal(other_list)
	h.HubController.SendToUser(id, other_json)

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success accept request",
	})
}

func (h *Handler) RemoveFriendHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	id := c.Params("user_id")

	err := h.RealtionsController.DeleteRelation(user_id, id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	me_list, _ := h.RealtionsController.ListRelations(user_id)
	me_json, _ := json.Marshal(me_list)
	h.HubController.SendToUser(user_id, me_json)

	other_list, _ := h.RealtionsController.ListRelations(id)
	other_json, _ := json.Marshal(other_list)
	h.HubController.SendToUser(id, other_json)

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success remove friend",
	})
}

func (h *Handler) GetOtherUser(c *fiber.Ctx) error {
	username := c.Params("username")

	user, err := h.RealtionsController.OtherUserByUsername(username)
	if err != nil {
		if err == errs.ErrUserNotFound {
			return c.Status(fiber.StatusNotFound).JSON(dto.ResponseWeb[any]{
				Message: err.Error(),
			})
		}
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.OtherUser]{
		Message: "success get data",
		Data:    *user,
	})
}
