package internal

import (
	"be-app/internal/app/domain/friend"
	refreshtoken "be-app/internal/app/domain/refresh_token"
	textchatuser "be-app/internal/app/domain/text_chat_user"
	"be-app/internal/app/domain/user"
	userprofile "be-app/internal/app/domain/user_profile"
	"be-app/internal/app/feature/auth"
	"be-app/internal/app/feature/chatting"
	"be-app/internal/app/feature/hub"
	"be-app/internal/app/feature/relations"
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
	userRepo := user.NewRepo()
	profileRepo := userprofile.NewRepo()
	rTokenRepo := refreshtoken.NewRepo()
	friendRepo := friend.NewRepo()
	textChatUserRepo := textchatuser.NewRepo()

	hubController := hub.NewController(a.DB, profileRepo, friendRepo)

	authController := auth.NewController(a.DB, userRepo, profileRepo, rTokenRepo)
	authHandler := auth.NewHandler(*a.Validate, authController)
	relationsController := relations.NewController(a.DB, friendRepo, profileRepo)
	relationsHandler := relations.NewHandler(*a.Validate, relationsController, hubController)
	hubHandler := hub.NewHandler(hubController)
	chattingController := chatting.NewController(a.DB, textChatUserRepo)
	chattingHandler := chatting.NewHandler(*a.Validate, chattingController, hubController)

	route.Routes{
		App:              a.App,
		AuthHandler:      authHandler,
		RealtionsHandler: relationsHandler,
		HubHandler:       hubHandler,
		ChattingHandler:  chattingHandler,
	}.SetupRoutes()
}
