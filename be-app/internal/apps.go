package internal

import (
	"be-app/internal/apps/domain/repository"
	"be-app/internal/apps/feature/auth"
	"be-app/internal/apps/feature/friendship"
	messagingchannel "be-app/internal/apps/feature/messaging_channel"
	profilesettings "be-app/internal/apps/feature/profile_settings"
	servermanagement "be-app/internal/apps/feature/server_management"
	servermember "be-app/internal/apps/feature/server_member"
	statusactivitiy "be-app/internal/apps/feature/status_activitiy"
	ws "be-app/internal/apps/websocket"
	"be-app/internal/route"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type AppsConfig struct {
	DB       *gorm.DB
	App      *fiber.App
	Validate *validator.Validate
}

func Apps(a *AppsConfig) {
	userRepo := repository.NewUserRepo()
	userProfileRepo := repository.NewUserProfileRepo()
	refreshTokenRepo := repository.NewRefreshTokenRepo()
	friendRepo := repository.NewFriendRepo()
	serverRepo := repository.NewServerRepo()
	joinServerRepo := repository.NewJoinServerRepo()
	channelRepo := repository.NewChannelRepo()
	channelCategoryRepo := repository.NewChannelCategoryRepo()
	channelMessageRepo := repository.NewChannelMessageRepo()

	hub := ws.NewHub()

	authService := auth.NewService(a.DB, *userRepo, *userProfileRepo, *refreshTokenRepo)
	authHandler := auth.NewHandler(*authService, *a.Validate)
	profileSettingsService := profilesettings.NewService(a.DB, *userRepo, *userProfileRepo)
	profileSettingsHandler := profilesettings.NewHandler(profileSettingsService, *a.Validate)
	friendshipService := friendship.NewService(a.DB, *friendRepo, *userRepo, *userProfileRepo)
	friendshipHandler := friendship.NewHandler(*friendshipService, *a.Validate, hub)
	serverManagementService := servermanagement.NewService(a.DB, *serverRepo, *joinServerRepo, *channelRepo, *channelCategoryRepo)
	serverManagementHandler := servermanagement.NewHandler(*serverManagementService, *a.Validate, hub)
	serverMemberService := servermember.NewService(a.DB, *joinServerRepo, *serverRepo, *userProfileRepo)
	serverMemberhandler := servermember.NewHandler(*serverMemberService, *a.Validate, hub)
	statusActivityService := statusactivitiy.NewService(a.DB, *userProfileRepo, *friendRepo, *joinServerRepo)
	messagingChannelService := messagingchannel.NewService(a.DB, *userRepo, *userProfileRepo, *channelMessageRepo, *serverRepo, *joinServerRepo, *channelRepo, *channelCategoryRepo)
	messagingChannelHandler := messagingchannel.NewHandler(*messagingChannelService, *a.Validate, hub)

	hubHandler := ws.NewHandler(hub, *statusActivityService)

	route.Routes{
		App:                     a.App,
		AuthHandler:             *authHandler,
		ProfileSettingsHandler:  *profileSettingsHandler,
		FriendshipHandler:       *friendshipHandler,
		ServerManagementHandler: *serverManagementHandler,
		ServerMemberHandler:     *serverMemberhandler,
		HubHandler:              *hubHandler,
		MessagingChannel:        *messagingChannelHandler,
	}.SetupRoutes()
}
