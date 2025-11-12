package route

import (
	"be-app/internal/apps/feature/auth"
	servermanagement "be-app/internal/apps/feature/server_management"
	servermember "be-app/internal/apps/feature/server_member"
	"be-app/internal/dto"
	"be-app/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type Routes struct {
	App                     *fiber.App
	AuthHandler             auth.Handler
	ServerManagementHandler servermanagement.Handler
	ServerMemberHandler     servermember.Handler
	// RealtionsHandler relations.Handler
	// HubHandler       hub.Handler
	// ChattingHandler  chatting.Handler
	// GroupingHandler  grouping.Handler
	// HubServerHandler        hub.Handler
	// ChannelMessagingHandler channelmessaging.Handler
}

func (r Routes) SetupRoutes() {
	r.App.Use(cors.New(cors.Config{
		AllowOrigins:     "http://127.0.0.1:3000, http://145.79.11.111:3000",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Content-Type, Authorization, Origin, Accept",
		AllowCredentials: true,
	}))

	r.App.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(dto.ResponseWeb[any]{
			Message: "This your root api",
		})
	})

	r.App.Post("/auth/register", r.AuthHandler.RegisterUserHandler)
	r.App.Put("/auth/login", r.AuthHandler.LoginUserHandler)
	r.App.Get("/auth/me", middleware.RequireJWTAuth(), r.AuthHandler.MeHandler)
	r.App.Put("/auth/refresh", r.AuthHandler.RefreshTokenHandler)
	r.App.Delete("/auth/logout", middleware.RequireJWTAuth(), r.AuthHandler.LogoutHandler)

	r.App.Post("/server/new", middleware.RequireJWTAuth(), r.ServerManagementHandler.CreateNewServerHandler)
	r.App.Get("/server/:code", r.ServerManagementHandler.GetServerByCodeHandler)

	r.App.Get("/server/member", middleware.RequireJWTAuth(), r.ServerMemberHandler.GetListServerHandler)
	// r.App.Post("/auth/register", r.AuthHandler.RegisterHandler)
	// r.App.Post("/auth/login", r.AuthHandler.LoginHandler)
	// r.App.Post("/auth/logout", middleware.RequireJWTAuth(), r.AuthHandler.LogoutHandler)
	// r.App.Get("/auth/refresh", r.AuthHandler.RefreshJWTHandler)
	// r.App.Get("/auth/me", middleware.RequireJWTAuth(), r.AuthHandler.MeHandler)
	// r.App.Put("/auth/username", middleware.RequireJWTAuth(), r.AuthHandler.ChangeUsernameHandler)
	// r.App.Put("/auth/profile", middleware.RequireJWTAuth(), r.AuthHandler.UpdateProfileHandler)

	// r.App.Get("/user/:username", r.RealtionsHandler.GetOtherUser)

	// r.App.Post("/friend/add/:username", middleware.RequireJWTAuth(), r.RealtionsHandler.AddFriendHandler)
	// r.App.Get("/friend/list", middleware.RequireJWTAuth(), r.RealtionsHandler.GetListFriendHandler)
	// r.App.Delete("/friend/cancel/:user_id", middleware.RequireJWTAuth(), r.RealtionsHandler.CancelSentFriendHandler)
	// r.App.Delete("/friend/decline/:user_id", middleware.RequireJWTAuth(), r.RealtionsHandler.DeclineRequestFriendHandler)
	// r.App.Post("/friend/accept/:user_id", middleware.RequireJWTAuth(), r.RealtionsHandler.AcceptRequestFriendHandler)
	// r.App.Delete("/friend/remove/:user_id", middleware.RequireJWTAuth(), r.RealtionsHandler.RemoveFriendHandler)

	// r.App.Post("/server", middleware.RequireJWTAuth(), r.GroupingHandler.CreateServerHandler)
	// r.App.Get("/server", middleware.RequireJWTAuth(), r.GroupingHandler.GetJoinServerHandler)
	// r.App.Put("/server/:id/:position", middleware.RequireJWTAuth(), r.GroupingHandler.UpdatePositionServerHandler)
	// r.App.Get("/server/:code", middleware.RequireJWTAuth(), r.GroupingHandler.GetServerByCodeHandler)
	// r.App.Post("/server/:server_id", middleware.RequireJWTAuth(), r.GroupingHandler.JoinServerHandler)

	// r.App.Post("/channel/category", middleware.RequireJWTAuth(), r.GroupingHandler.CreateCategoryChannelHandler)
	// r.App.Delete("/channel/category/:category_id", middleware.RequireJWTAuth(), r.GroupingHandler.DeleteCategoryChannelHandler)
	// r.App.Post("/channel", middleware.RequireJWTAuth(), r.GroupingHandler.CreateChannelHandler)
	// r.App.Get("/channel/:server_id", middleware.RequireJWTAuth(), r.GroupingHandler.GetChannelAndCategoryHandler)
	// r.App.Get("/channel", middleware.RequireJWTAuth(), r.GroupingHandler.GetAllChannelJoinServerHandler)
	// r.App.Delete("/channel/:channel_id", middleware.RequireJWTAuth(), r.GroupingHandler.DeleteChannelHandler)
	// r.App.Put("/channel/reorder/:server_id", middleware.RequireJWTAuth(), r.GroupingHandler.ReorderChannelHandler)

	// r.App.Post("/msg/channel/:channel_id", middleware.RequireJWTAuth(), r.ChannelMessagingHandler.AddTextMessageToChannel)
	// r.App.Get("/msg/channel/:channel_id", middleware.RequireJWTAuth(), r.ChannelMessagingHandler.ListTextMsgByChannelHandler)

	// r.App.Post("/dm-text/send/:user_id", middleware.RequireJWTAuth(), r.ChattingHandler.AddTextChatHandler)
	// r.App.Get("/dm-text/list/:user_id", middleware.RequireJWTAuth(), r.ChattingHandler.ListTextChatHandler)

	// r.App.Use("/ws", func(c *fiber.Ctx) error {
	// 	if websocket.IsWebSocketUpgrade(c) {
	// 		return c.Next()
	// 	}
	// 	return fiber.ErrUpgradeRequired
	// })
	// r.App.Get("/ws", websocket.New(r.HubHandler.Socket))

	// r.App.Get("/img/:id", func(c *fiber.Ctx) error {

	// 	filename := c.Params("id")
	// 	imageDir := "./public/"

	// 	return c.SendFile(imageDir + filename)

	// })
}

func RouteNotFound(c *fiber.Ctx, err error) error {
	if fiberErr, ok := err.(*fiber.Error); ok {
		if fiberErr.Code == fiber.StatusMethodNotAllowed {
			return c.Status(fiber.StatusMethodNotAllowed).JSON(dto.ResponseWeb[interface{}]{
				Message: "Method is not allowed",
			})
		}
		if fiberErr.Code == fiber.StatusNotFound {
			return c.Status(fiber.StatusNotFound).JSON(dto.ResponseWeb[interface{}]{
				Message: "Route is not found",
			})
		}
	}

	return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[interface{}]{
		Message: "Internal Server Error",
	})
}
