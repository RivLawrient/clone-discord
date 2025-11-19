package websocket

import (
	"encoding/json"
	"log"
	"sync"
)

type Hub struct {
	// Klien aktif, key: userID, value: slice of connections (multi-device support)
	Clients map[string][]*Client

	// Mutex untuk sinkronisasi akses ke map Clients
	mu sync.RWMutex

	// Channel untuk broadcast internal (opsional)
	// Broadcast chan []byte
}

func NewHub() *Hub {
	return &Hub{
		Clients: make(map[string][]*Client),
	}
}

// RegisterClient menambahkan koneksi klien baru
func (h *Hub) RegisterClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	// Tambahkan client ke list koneksi milik userID tersebut
	h.Clients[client.UserID] = append(h.Clients[client.UserID], client)
	log.Printf("User %s connected. Total connections: %d", client.UserID, len(h.Clients))

	// Di sini seharusnya Anda memanggil Service untuk update status ke "Online"
	// (Hub hanya memanggil, tidak boleh mengandung logic update DB)
	// h.StatusService.UserOnline(client.UserID) 👈 Contoh pemanggilan service
}

// UnregisterClient menghapus koneksi klien
func (h *Hub) UnregisterClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if connections, ok := h.Clients[client.UserID]; ok {
		// Hapus koneksi dari slice (implementasi RemoveClient Anda sudah bagus)
		for i, c := range connections {
			if c == client {
				h.Clients[client.UserID] = append(connections[:i], connections[i+1:]...)
				break
			}
		}

		// Jika tidak ada koneksi lagi, hapus key dan panggil Service "Invisible"
		if len(h.Clients[client.UserID]) == 0 {
			delete(h.Clients, client.UserID)
			// h.StatusService.UserInvisible(client.UserID) 👈 Contoh pemanggilan service
			log.Printf("User %s fully disconnected.", client.UserID)
		}
	}
}

// SendToUser mengirim pesan ke semua koneksi milik userID tertentu
func (h *Hub) SendToUser(userID []string, msg any) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	message, _ := json.Marshal(msg)
	for _, v := range userID {

		if clients, ok := h.Clients[v]; ok {
			for _, client := range clients {
				// Kirim melalui channel (ini lebih aman daripada langsung WriteMessage)
				select {
				case client.Send <- message:
				default:
					// Jika channel penuh, disconnect client
					close(client.Send)
					h.UnregisterClient(client)
				}
			}
		}
	}

}

// Broadcast mengirim pesan ke semua klien aktif
func (h *Hub) Broadcast(message []byte) {
	// ... logic loop ke semua client dan kirim via client.Send ...
}
