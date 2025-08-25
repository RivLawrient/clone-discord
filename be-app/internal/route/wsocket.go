package route

import (
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

var clients = make(map[*websocket.Conn]bool)
var mu sync.Mutex

func Socket(c *websocket.Conn) {
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
}
