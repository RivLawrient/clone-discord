package route

import (
	"be-app/internal/app/feature/auth"
	"be-app/internal/app/feature/relations"
	"be-app/internal/dto"
	"be-app/internal/middleware"
	"log"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/websocket/v2"
)

type Routes struct {
	App              *fiber.App
	AuthHandler      auth.Handler
	RealtionsHandler relations.Handler
}

var clients = make(map[*websocket.Conn]bool)
var mu sync.Mutex

func (r Routes) SetupRoutes() {
	r.App.Use(cors.New(cors.Config{
		AllowOrigins:     "http://127.0.0.1:3000, http://145.79.11.111:3000",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Content-Type, Authorization, Origin, Accept",
		AllowCredentials: true,
	}))
	r.App.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(dto.ResponseWeb[any]{
			Message: "This yout root api",
		})
	})
	r.App.Post("/auth/register", r.AuthHandler.RegisterHandler)
	r.App.Post("/auth/login", r.AuthHandler.LoginHandler)
	r.App.Post("/auth/logout", middleware.RequireJWTAuth(), r.AuthHandler.LogoutHandler)
	r.App.Get("/auth/refresh", r.AuthHandler.RefreshJWTHandler)
	r.App.Get("/auth/me", middleware.RequireJWTAuth(), r.AuthHandler.MeHandler)

	r.App.Post("/friend/add/:username", middleware.RequireJWTAuth(), r.RealtionsHandler.AddFriendHandler)
	r.App.Get("/friend/list", middleware.RequireJWTAuth(), r.RealtionsHandler.GetListFriendHandler)

	r.App.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	r.App.Get("/ws", websocket.New(func(c *websocket.Conn) {
		// Tambahkan client ke daftar
		mu.Lock()
		clients[c] = true
		mu.Unlock()

		log.Println("Client connected")
		defer func() {
			// Hapus dari daftar ketika disconnect
			mu.Lock()
			delete(clients, c)
			mu.Unlock()
			log.Println("Client disconnected")
			log.Printf("current connected: %d", len(clients))
			c.Close()
		}()

		log.Printf("current connected: %d", len(clients))
		// Loop baca pesan dari client
		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("Read error:", err)
				break
			}

			log.Printf("Received: %s", msg)

			// Kirim pesan ke semua client lain
			mu.Lock()
			for conn := range clients {
				if conn != c { // jangan kirim ke pengirim
					if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
						log.Println("Write error:", err)
					}
				}
			}
			mu.Unlock()
		}
	}))
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
