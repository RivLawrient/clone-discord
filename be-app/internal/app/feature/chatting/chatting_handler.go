package chatting

import (
	"be-app/internal/app/feature/hub"
	"be-app/internal/dto"
	"be-app/internal/helper"
	"encoding/json"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Validate           validator.Validate
	ChattingController Controller
	HubController      *hub.Controller
}

func NewHandler(validate validator.Validate, chattingController Controller, hubController *hub.Controller) Handler {
	return Handler{
		Validate:           validate,
		ChattingController: chattingController,
		HubController:      hubController,
	}
}

func (h *Handler) AddTextChatHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	other_user_id := c.Params("user_id")
	request := new(dto.TextChatRequest)
	c.BodyParser(request)

	if err := h.Validate.Struct(request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[map[string]string]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	response, err := h.ChattingController.AddNewTextChat(user_id, request.Text, other_user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	responseJson, _ := json.Marshal(fiber.Map{
		"dm": response,
	})
	h.HubController.SendToUser(other_user_id, responseJson)
	h.HubController.SendToUser(user_id, responseJson)

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.TextChatDMList]{
		Message: "success send text chat",
		Data:    *response,
	})

}

func (h *Handler) ListTextChatHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	other_user_id := c.Params("user_id")

	list, err := h.ChattingController.ListTextChat(user_id, other_user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[[]dto.TextChatDMList]{
		Message: "success send text chat",
		Data:    *list,
	})
}
