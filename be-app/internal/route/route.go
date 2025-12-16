package route

import (
	"be-app/internal/apps/feature/auth"
	"be-app/internal/apps/feature/friendship"
	messagingchannel "be-app/internal/apps/feature/messaging_channel"
	messaginguser "be-app/internal/apps/feature/messaging_user"
	profilesettings "be-app/internal/apps/feature/profile_settings"
	servermanagement "be-app/internal/apps/feature/server_management"
	servermember "be-app/internal/apps/feature/server_member"
	videoconversation "be-app/internal/apps/feature/video_conversation"
	ws "be-app/internal/apps/websocket"
	"be-app/internal/dto"
	"be-app/internal/middleware"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/websocket/v2"
)

type Routes struct {
	App                      *fiber.App
	AuthHandler              auth.Handler
	ProfileSettingsHandler   profilesettings.Handler
	FriendshipHandler        friendship.Handler
	ServerManagementHandler  servermanagement.Handler
	ServerMemberHandler      servermember.Handler
	HubHandler               ws.Handler
	MessagingChannelHandler  messagingchannel.Handler
	VideoConversationHandler videoconversation.Handler
	MessagingUser            messaginguser.Handler
}

func (r Routes) SetupRoutes() {
	r.App.Use(cors.New(cors.Config{
		AllowOrigins:     os.Getenv("ALLOW_ORIGIN"),
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Content-Type, Authorization, Origin, Accept",
		AllowCredentials: true,
	}))

	r.App.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(dto.ResponseWeb[any]{
			Message: "This your root api",
		})
	})

	//AUTH
	r.App.Post("/auth/register", r.AuthHandler.RegisterUserHandler)
	r.App.Post("/auth/login", r.AuthHandler.LoginUserHandler)
	r.App.Get("/auth/me", middleware.RequireJWTAuth(), r.AuthHandler.MeHandler)
	r.App.Post("/auth/refresh", r.AuthHandler.RefreshTokenHandler)
	r.App.Post("/auth/logout", middleware.RequireJWTAuth(), r.AuthHandler.LogoutHandler)

	// USER ME
	r.App.Patch("/user/me/username", middleware.RequireJWTAuth(), r.ProfileSettingsHandler.NewUsernameHandler)
	r.App.Patch("/user/me/profile", middleware.RequireJWTAuth(), r.ProfileSettingsHandler.UpdateProfileHandler)

	// FRIEND
	r.App.Post("/friends/request/:username", middleware.RequireJWTAuth(), r.FriendshipHandler.NewRequestFriendHandler)
	r.App.Get("/friends", middleware.RequireJWTAuth(), r.FriendshipHandler.GetListAllHandler)
	r.App.Post("/friends/accept/:user_id", middleware.RequireJWTAuth(), r.FriendshipHandler.AcceptRequestHandler)
	r.App.Post("/friends/decline/:user_id", middleware.RequireJWTAuth(), r.FriendshipHandler.DeclineRequestHandler)
	r.App.Delete("/friends/:user_id", middleware.RequireJWTAuth(), r.FriendshipHandler.RemoveFriendHanlder)

	// SERVER
	r.App.Post("/server", middleware.RequireJWTAuth(), r.ServerManagementHandler.CreateNewServerHandler)
	r.App.Get("/server/code/:code", r.ServerManagementHandler.GetServerByCodeHandler)
	r.App.Get("/server/channels/:server_id", middleware.RequireJWTAuth(), r.ServerManagementHandler.GetListChannelAndCategoryServerHandler)
	r.App.Get("/server/channels", middleware.RequireJWTAuth(), r.ServerManagementHandler.GetListChannelAndCategoryUserHandler)
	r.App.Post("/server/channels/reorder/:server_id", middleware.RequireJWTAuth(), r.ServerManagementHandler.ReorderChannelHandler)
	r.App.Post("/server/profile/:server_id", middleware.RequireJWTAuth(), r.ServerManagementHandler.UpdateProfileHandler)
	r.App.Delete("/server/:server_id", middleware.RequireJWTAuth(), r.ServerManagementHandler.DeleteServerHandler)
	r.App.Get("/server/members/:server_id", middleware.RequireJWTAuth(), r.ServerManagementHandler.GetListMemberServerHandler)

	// SERVER CATEGORY
	r.App.Post("/server/category", middleware.RequireJWTAuth(), r.ServerManagementHandler.CreateCategoryChannelHandler)
	r.App.Delete("/server/category/:category_id", middleware.RequireJWTAuth(), r.ServerManagementHandler.DeleteCategoryChannelHandler)
	r.App.Post("/server/category/:category_id", middleware.RequireJWTAuth(), r.ServerManagementHandler.RenameCateogryHandler)

	// SERVER CHANNEL
	r.App.Post("/server/channel", middleware.RequireJWTAuth(), r.ServerManagementHandler.CreateChannelHandler)
	r.App.Delete("/server/channel/:channel_id", middleware.RequireJWTAuth(), r.ServerManagementHandler.DeleteChannelHandler)
	r.App.Post("/server/channel/:channel_id", middleware.RequireJWTAuth(), r.ServerManagementHandler.RenameChannelHandler)

	// SERVER ME
	r.App.Get("/server/me", middleware.RequireJWTAuth(), r.ServerMemberHandler.GetListServerHandler)
	r.App.Post("/server/me/:server_id/:new_position", middleware.RequireJWTAuth(), r.ServerMemberHandler.UpdateServerPositionHandler)
	r.App.Post("/server/join/:server_id", middleware.RequireJWTAuth(), r.ServerMemberHandler.JoinServerHandler)
	r.App.Delete("/server/me/:server_id", middleware.RequireJWTAuth(),
		r.ServerMemberHandler.LeaveServerHandler)

	// CHANNEL MESSAGE
	r.App.Post("/message/channel/:channel_id", middleware.RequireJWTAuth(), r.MessagingChannelHandler.AddTextMsgHandler)
	r.App.Get("/message/channel/:channel_id", middleware.RequireJWTAuth(), r.MessagingChannelHandler.GetListTextMsgHandler)
	r.App.Put("/message/chat/:chat_id", middleware.RequireJWTAuth(), r.MessagingChannelHandler.EditTextMsgHandler)
	r.App.Delete("/message/chat/:chat_id", middleware.RequireJWTAuth(), r.MessagingChannelHandler.RemoveTextMsgHandler)

	// VIDEO CONVERSATION
	r.App.Get("/channel/:channel_id", middleware.RequireJWTAuth(), r.VideoConversationHandler.GetTokenChannelHandler)

	// DM USER
	r.App.Post("/dm/text/:user_id", middleware.RequireJWTAuth(), r.MessagingUser.AddTextMsgHandler)
	r.App.Get("/dm/text/:user_id", middleware.RequireJWTAuth(), r.MessagingUser.GetListTextMsgHandler)
	r.App.Put("/dm/text/:chat_id", middleware.RequireJWTAuth(), r.MessagingUser.EditTextMsgHandler)
	r.App.Delete("/dm/text/:chat_id", middleware.RequireJWTAuth(), r.MessagingUser.RemoveTextMsgHandler)
	r.App.Get("/dm", middleware.RequireJWTAuth(), r.MessagingUser.ListDMHandler)

	// OTHER USER
	r.App.Get("/user/:username", middleware.RequireJWTAuth(), r.ProfileSettingsHandler.GetProfileHandler)

	// HUB
	r.App.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	r.App.Get("/ws", websocket.New(r.HubHandler.Socket))
	// r.App.Get("/ws", websocket.New(r.HubHandler.Socket, websocket.Config{

	// 	CheckOrigin: func(c *fiber.Ctx) bool {
	// 		// DEV
	// 		return true
	// 	},
	// }))

	r.App.Get("/img/:id", func(c *fiber.Ctx) error {
		filename := c.Params("id")
		imageDir := "./public/"

		return c.SendFile(imageDir + filename)
	})

}

func RouteNotFound(c *fiber.Ctx, err error) error {
	if fiberErr, ok := err.(*fiber.Error); ok {
		if fiberErr.Code == fiber.StatusMethodNotAllowed {
			return c.Status(fiber.StatusMethodNotAllowed).JSON(dto.ResponseWeb[any]{
				Message: "Method is not allowed",
			})
		}
		if fiberErr.Code == fiber.StatusNotFound {
			return c.Status(fiber.StatusNotFound).JSON(dto.ResponseWeb[any]{
				Message: "Route is not found",
			})
		}
	}

	return c.Status(fiber.StatusInternalServerError).JSON(dto.ResponseWeb[any]{
		Message: "Internal Server Error",
	})
}
