package servermember

import (
	"be-app/internal/dto"
	"be-app/internal/errs"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Service Service
}

func NewHandler(service Service, validate validator.Validate) *Handler {
	return &Handler{
		Service: service,
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

	var responses []dto.ServerListResponse
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
