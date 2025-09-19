package grouping

import (
	"be-app/internal/dto"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Controller Controller
}

func NewHandler(controller Controller) Handler {
	return Handler{
		Controller: controller,
	}
}

func (h Handler) GenerateFiveServerHandler(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)

	if err := h.Controller.GenerateFiveServer(user_id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[any]{
		Message: "success send text chat",
		Data:    "success",
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
