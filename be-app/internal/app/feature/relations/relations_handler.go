package relations

import (
	"be-app/internal/app/domain/friend"
	"be-app/internal/dto"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Validate            validator.Validate
	RealtionsController Controller
}

func NewHandler(validate validator.Validate, relationsController Controller) Handler {
	return Handler{
		Validate:            validate,
		RealtionsController: relationsController,
	}
}

func (h Handler) AddFriendHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	username := c.Params("username")

	response, err := h.RealtionsController.NewRequestFriend(username, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[friend.Friend]{
		Message: "success send request",
		Data:    *response,
	})
}

func (h Handler) GetListFriendHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)

	data, err := h.RealtionsController.ListRelations(user_id)
	if err != nil {
		return nil
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.GroupFriendList]{
		Message: "success get data",
		Data:    *data,
	})
}
