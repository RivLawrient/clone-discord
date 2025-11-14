package websocket

import (
	"time"

	"github.com/gofiber/websocket/v2"
)

const (
	// Waktu tunggu untuk menulis pesan
	writeWait = 10 * time.Second
)

type Client struct {
	Hub    *Hub            // Referensi ke Hub untuk registrasi/deregistrasi
	Conn   *websocket.Conn // Koneksi WebSocket asli
	UserID string          // ID pengguna yang terautentikasi
	// Outbound channel untuk pesan yang akan dikirim ke client
	Send chan []byte
}

// ReadPump membaca pesan dari klien dan meneruskannya
// Method ini akan dipanggil di goroutine
// func (c *Client) ReadPump() {
// 	defer func() {
// 		// Panggil Hub untuk menghapus klien dan close koneksi
// 		c.Hub.UnregisterClient(c)
// 		c.Conn.Close()
// 	}()

// 	// Konfigurasi batas waktu baca/tulis
// 	// c.Conn.SetReadLimit(...)
// 	// c.Conn.SetReadDeadline(...)

// 	for {
// 		// Baca pesan mentah dari koneksi
// 		_, message, err := c.Conn.ReadMessage()
// 		if err != nil {
// 			// Handle error baca (biasanya klien disconnect)
// 			break
// 		}

// 		// Di sini Anda bisa meneruskan pesan ke Service/Logic
// 		// Misalnya: c.Hub.ReceiveMessage(c.UserID, message)

// 		// Untuk saat ini, kita akan fokus pada Hub & Handler
// 	}
// }

// // WritePump menulis pesan dari channel Send ke koneksi WebSocket
// // Method ini akan dipanggil di goroutine
// func (c *Client) WritePump() {
// 	ticker := time.NewTicker(pingPeriod) // Jika Anda menggunakan ping/pong
// 	defer func() {
// 		ticker.Stop()
// 		c.Conn.Close()
// 	}()

// 	for {
// 		select {
// 		case message, ok := <-c.Send:
// 			// Set batas waktu penulisan
// 			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))

// 			if !ok {
// 				// Hub menutup channel. Kirim pesan Close.
// 				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
// 				return
// 			}

// 			// Tulis pesan
// 			err := c.Conn.WriteMessage(websocket.TextMessage, message)
// 			if err != nil {
// 				return
// 			}

// 			// case <-ticker.C: // Jika menggunakan Ping/Pong
// 			// c.Conn.SetWriteDeadline...
// 			// c.Conn.WriteMessage(websocket.PingMessage, nil)

// 		}
// 	}
// }
