package channelmessaging

import (
	"be-app/internal/app/feature/hub"
	"be-app/internal/dto"
	"be-app/internal/helper"
	"encoding/json"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Validate      validator.Validate
	Controlller   Controller
	HubController *hub.Controller
}

func NewHandler(validate validator.Validate, controller Controller, hub *hub.Controller) Handler {
	return Handler{
		Validate:      validate,
		Controlller:   controller,
		HubController: hub,
	}
}

func (h Handler) AddTextMessageToChannel(c *fiber.Ctx) error {
	user_id := c.Locals("user_id").(string)
	channel_id := c.Params("channel_id")
	request := new(dto.TextMessageRequest)
	c.BodyParser(request)

	if err := h.Validate.Struct(request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "validation failed",
			Data:    helper.ValidationMsg(err),
		})
	}

	msg, profile, user, err := h.Controlller.AddTextMsgToChannel(user_id, channel_id, request.Text)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ResponseWeb[any]{
			Message: "something wrong",
			Data:    err.Error(),
		})
	}

	msg_json, _ := json.Marshal(dto.MessageChannelSocket{
		ChannelId: channel_id,
		MessageChannel: dto.MessageChannel{
			ID: msg.ID,
			User: dto.UserOther{
				UserId:         profile.UserId,
				Name:           profile.Name,
				Username:       profile.Username,
				Avatar:         profile.Avatar,
				AvatarBg:       profile.AvatarBg,
				StatusActivity: profile.StatusActivity,
				Bio:            profile.Bio,
				BannerColor:    profile.BannerColor,
			},
			Text:      msg.Text,
			CreatedAt: msg.CreatedAt,
		},
	})
	for _, v := range *user {
		h.HubController.SendToUser(v, msg_json)
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[dto.MessageChannel]{
		Message: "success send text chat",
		Data: dto.MessageChannel{
			ID: msg.ID,
			User: dto.UserOther{
				UserId:         profile.UserId,
				Name:           profile.Name,
				Username:       profile.Username,
				Avatar:         profile.Avatar,
				AvatarBg:       profile.AvatarBg,
				StatusActivity: profile.StatusActivity,
				Bio:            profile.Bio,
				BannerColor:    profile.BannerColor,
			},
			Text:      msg.Text,
			CreatedAt: msg.CreatedAt,
		},
	})
}

func (h Handler) ListTextMsgByChannelHandler(c *fiber.Ctx) error {
	channel_id := c.Params("channel_id")

	result, err := h.Controlller.ListTextMsgByChannel(channel_id)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(dto.ResponseWeb[[]dto.MessageChannel]{
		Message: "success send text chat",
		Data:    *result,
	})

}
