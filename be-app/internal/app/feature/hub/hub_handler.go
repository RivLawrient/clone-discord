package hub

import (
	"log"
	"os"

	"github.com/gofiber/websocket/v2"
	"github.com/golang-jwt/jwt/v4"
)

type Handler struct {
	HubController *Controller
}

func NewHandler(hubController *Controller) Handler {
	return Handler{
		HubController: hubController,
	}
}

var jwtSecretKey = []byte(os.Getenv("JWT_SECRET")) // Ganti dengan env

func (h *Handler) Socket(c *websocket.Conn) {
	tokenStr := c.Query("token")
	if tokenStr == "" {
		log.Println("no token")
		c.Close()
		return
	}

	// 2. Parse & verifikasi JWT
	claims := jwt.MapClaims{}
	tkn, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return jwtSecretKey, nil
	})

	if err != nil || !tkn.Valid {
		log.Println("invalid token:", err)
		c.Close()
		return
	}
	user_id, ok := claims["user_id"].(string)
	if !ok {
		log.Println("no user_id in token")
		c.Close()
		return
	}

	h.HubController.AddClient(user_id, c)
	defer func() {
		// Hapus dari daftar ketika disconnect
		h.HubController.RemoveClient(user_id, c)
		log.Println("Client disconnected")
		log.Printf("current connected: %d", h.HubController.GetLength(c))
		h.HubController.UpdateStatus(user_id, "Invisible")
		c.Close()
	}()

	h.HubController.UpdateStatus(user_id, "Online")

	log.Printf("user %s coneccted", user_id)
	log.Printf("current connected: %d", h.HubController.GetLength(c))

	// Loop baca pesan dari client
	for {
		_, msg, err := c.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		if string(msg) == "idle" {
			h.HubController.UpdateStatus(user_id, "Idle")
		}
		if string(msg) == "online" {
			h.HubController.UpdateStatus(user_id, "Online")
		}

		log.Printf("Received: %s", msg)
	}
}
