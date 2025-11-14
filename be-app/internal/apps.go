package internal

import (
	"be-app/internal/apps/domain/repository"
	"be-app/internal/apps/feature/auth"
	servermanagement "be-app/internal/apps/feature/server_management"
	servermember "be-app/internal/apps/feature/server_member"
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
	// userRepo := user.NewRepo()
	// profileRepo := userprofile.NewRepo()
	// rTokenRepo := refreshtoken.NewRepo()
	// friendRepo := friend.NewRepo()
	// textChatUserRepo := textchatuser.NewRepo()
	// serverRepo := server.NewRepo()
	// joinServerRepo := joinserver.NewRepo()
	// categorychannelRepo := categorychannel.NewRepo()
	// channelRepo := channel.NewRepo()
	// messageChannelRepo := messagechannel.NewRepo()

	// hubController := hub.NewController(a.DB, profileRepo, friendRepo)

	// authController := auth.NewController(a.DB, userRepo, profileRepo, rTokenRepo)
	// authHandler := auth.NewHandler(*a.Validate, authController)
	// relationsController := relations.NewController(a.DB, friendRepo, profileRepo)
	// relationsHandler := relations.NewHandler(*a.Validate, relationsController, hubController)
	// hubHandler := hub.NewHandler(hubController)
	// chattingController := chatting.NewController(a.DB, textChatUserRepo)
	// chattingHandler := chatting.NewHandler(*a.Validate, chattingController, hubController)
	// groupingController := grouping.NewController(a.DB, serverRepo, joinServerRepo, categorychannelRepo, channelRepo)
	// groupingHandler := grouping.NewHandler(groupingController, *a.Validate, hubController)
	// channelMessageingController := channelmessaging.NewController(a.DB, messageChannelRepo, joinServerRepo, channelRepo, profileRepo)
	// channelMessagingHandler := channelmessaging.NewHandler(*a.Validate, channelMessageingController, hubController)

	userRepo := repository.NewUserRepo()
	userProfileRepo := repository.NewUserProfileRepo()
	refreshTokenRepo := repository.NewRefreshTokenRepo()
	serverRepo := repository.NewServerRepo()
	joinServerRepo := repository.NewJoinServerRepo()
	channelRepo := repository.NewChannelRepo()
	channelCategoryRepo := repository.NewChannelCategoryRepo()

	authService := auth.NewService(a.DB, *userRepo, *userProfileRepo, *refreshTokenRepo)
	authHandler := auth.NewHandler(*authService, *a.Validate)
	serverManagementService := servermanagement.NewService(a.DB, *serverRepo, *joinServerRepo, *channelRepo, *channelCategoryRepo)
	serverManagementHandler := servermanagement.NewHandler(*serverManagementService, *a.Validate)
	serverMemberService := servermember.NewService(a.DB, *joinServerRepo)
	serverMemberhandler := servermember.NewHandler(*serverMemberService, *a.Validate)

	route.Routes{
		App:                     a.App,
		AuthHandler:             *authHandler,
		ServerManagementHandler: *serverManagementHandler,
		ServerMemberHandler:     *serverMemberhandler,
		// AuthHandler:             authHandler,
		// RealtionsHandler:        relationsHandler,
		// HubHandler:              hubHandler,
		// ChattingHandler:         chattingHandler,
		// GroupingHandler:         groupingHandler,
		// ChannelMessagingHandler: channelMessagingHandler,
	}.SetupRoutes()
}
