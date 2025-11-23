package websocket

import (
	statusactivitiy "be-app/internal/apps/feature/status_activitiy"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/golang-jwt/jwt/v4"
)

type Handler struct {
	Hub                   *Hub
	StatusActivityService statusactivitiy.Service
}

func NewHandler(Hub *Hub, statusActivityService statusactivitiy.Service) *Handler {
	return &Handler{
		Hub:                   Hub,
		StatusActivityService: statusActivityService,
	}
}

var jwtSecretKey = []byte(os.Getenv("JWT_SECRET")) // Ganti dengan env

func (h *Handler) Socket(c *websocket.Conn) {
	// 1. Ambil userID (lo bisa ganti jadi ambil dari JWT yang di-attach sama Fiber ctx)
	token := c.Query("token")
	if token == "" {
		c.WriteMessage(websocket.TextMessage, []byte("missing token"))
		c.Close()
		return
	}

	claims := jwt.MapClaims{}
	tkn, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
		return jwtSecretKey, nil
	})

	if err != nil || !tkn.Valid {
		c.Close()
		return
	}
	userID, ok := claims["user_id"].(string)
	if !ok {
		c.Close()
		return
	}

	client := &Client{
		UserID: userID,
		Conn:   c,
		Send:   make(chan []byte, 256),
		Hub:    h.Hub,
	}

	// 2. Register
	h.Hub.RegisterClient(client)
	// online, _ := h.StatusActivityService.SetStatusUser(userID, statusactivitiy.StatusOnline)
	// onlinJson, _ := json.Marshal(online)
	// h.Hub.SendToUser([]string{userID}, onlinJson)

	// 3. Pastikan unregister saat keluar
	defer func() {
		h.Hub.UnregisterClient(client)
		h.StatusActivityService.SetStatusUser(userID, statusactivitiy.StatusOffline)
		user, status, _ := h.StatusActivityService.UpdateStatusToFriendList(userID, statusactivitiy.StatusOffline)
		h.Hub.SendToUser(*user, fiber.Map{
			"friend_status": status,
		})
		member, status, _ := h.StatusActivityService.UpdateStatusToServerMember(userID, statusactivitiy.StatusOffline)
		h.Hub.SendToUser(*member, fiber.Map{
			"member_status": status,
		})
		c.Close()
	}()

	go client.WritePump()

	for {
		_, msg, err := c.ReadMessage()
		if err != nil {
			break
		}

		if string(msg) == "idle" {
			idle, _ := h.StatusActivityService.SetStatusUser(userID, statusactivitiy.StatusIdle)
			h.Hub.SendToUser([]string{userID}, idle)
			user, status, _ := h.StatusActivityService.UpdateStatusToFriendList(userID, statusactivitiy.StatusActivity(idle.StatusActivity))
			h.Hub.SendToUser(*user, fiber.Map{
				"friend_status": status,
			})
			member, status, _ := h.StatusActivityService.UpdateStatusToServerMember(userID, statusactivitiy.StatusIdle)
			h.Hub.SendToUser(*member, fiber.Map{
				"member_status": status,
			})
		}
		if string(msg) == "online" {
			onl, _ := h.StatusActivityService.SetStatusUser(userID, statusactivitiy.StatusOnline)
			h.Hub.SendToUser([]string{userID}, onl)

			user, status, _ := h.StatusActivityService.UpdateStatusToFriendList(userID, statusactivitiy.StatusActivity(onl.StatusActivity))
			h.Hub.SendToUser(*user, fiber.Map{
				"friend_status": status,
			})
			member, status, _ := h.StatusActivityService.UpdateStatusToServerMember(userID, statusactivitiy.StatusOnline)
			h.Hub.SendToUser(*member, fiber.Map{
				"member_status": status,
			})
		}
	}

}
