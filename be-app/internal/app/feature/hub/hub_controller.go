// package hub

// import (
// 	"fmt"
// 	"sync"

// 	"github.com/gofiber/websocket/v2"
// )

// type Controller struct {
// 	clients map[*websocket.Conn]bool
// 	mu      sync.Mutex
// }

// func NewController() Controller {
// 	return Controller{
// 		clients: make(map[*websocket.Conn]bool),
// 	}
// }

// func (h *Controller) AddClient(conn *websocket.Conn) {
// 	h.mu.Lock()
// 	defer h.mu.Unlock()
// 	h.clients[conn] = true
// }

// func (h *Controller) RemoveClient(conn *websocket.Conn) {
// 	h.mu.Lock()
// 	defer h.mu.Unlock()
// 	delete(h.clients, conn)
// 	conn.Close()
// }

// func (h *Controller) GetLength(conn *websocket.Conn) int {
// 	return len(h.clients)
// }

//	func (h *Controller) Broadcast(message string) {
//		h.mu.Lock()
//		defer h.mu.Unlock()
//		for client := range h.clients {
//			err := client.WriteMessage(websocket.TextMessage, []byte(message))
//			if err != nil {
//				fmt.Println("Error send:", err)
//				h.RemoveClient(client)
//			}
//		}
//	}
package hub

import (
	"be-app/internal/app/domain/friend"
	userprofile "be-app/internal/app/domain/user_profile"
	"be-app/internal/dto"
	"encoding/json"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"gorm.io/gorm"
)

type Controller struct {
	clients      map[string][]*websocket.Conn // key: user_id
	mu           sync.Mutex
	DB           *gorm.DB
	UProfileRepo userprofile.Repo
	FriendRepo   friend.Repo
}

func NewController(db *gorm.DB, uProfileRepo userprofile.Repo, friendRepo friend.Repo) *Controller {
	return &Controller{
		clients:      make(map[string][]*websocket.Conn),
		DB:           db,
		UProfileRepo: userprofile.NewRepo(),
		FriendRepo:   friendRepo,
	}
}

func (h *Controller) AddClient(userID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[userID] = append(h.clients[userID], conn)
}

func (h *Controller) RemoveClient(userID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if conns, ok := h.clients[userID]; ok {
		newConns := []*websocket.Conn{}
		for _, c := range conns {
			if c != conn {
				newConns = append(newConns, c)
			} else {
				c.Close()
			}
		}
		if len(newConns) > 0 {
			h.clients[userID] = newConns
		} else {
			delete(h.clients, userID)
		}
	}
}

func (h *Controller) GetLength(conn *websocket.Conn) int {
	return len(h.clients)
}

func (h *Controller) UpdateStatus(user_id string, status_activity string) error {
	tx := h.DB.Begin()
	defer tx.Rollback()

	err := h.UProfileRepo.UpdateStatusActivity(tx, user_id, status_activity)
	if err != nil {
		return err
	}
	dataList := []dto.FriendList{}
	h.FriendRepo.GetListByUserId(tx, user_id, &dataList)

	if err := tx.Commit().Error; err != nil {
		return err
	}

	dataJson, _ := json.Marshal(fiber.Map{
		"friend": dto.StatusUpdate{
			UserId:         user_id,
			StatusActivity: status_activity,
		},
	})

	h.mu.Lock()
	defer h.mu.Unlock()
	for _, fr := range dataList {
		if conns, ok := h.clients[fr.UserId]; ok {
			for _, conn := range conns {
				err := conn.WriteMessage(websocket.TextMessage, dataJson)
				if err != nil {
					h.RemoveClient(user_id, conn)
				}
			}
		}
	}

	selfJson, _ := json.Marshal(dto.StatusUpdate{
		UserId:         user_id,
		StatusActivity: status_activity,
	})

	if conns, ok := h.clients[user_id]; ok {
		for _, conn := range conns {
			err := conn.WriteMessage(websocket.TextMessage, selfJson)
			if err != nil {
				h.RemoveClient(user_id, conn)
			}
		}
	}

	return nil
}

func (h *Controller) SendToUser(userID string, message []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if conns, ok := h.clients[userID]; ok {
		for _, conn := range conns {
			err := conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				h.RemoveClient(userID, conn)
			}
		}
	}
}

func (h *Controller) Broadcast(message []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for userID, conns := range h.clients {
		for _, conn := range conns {
			err := conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				h.RemoveClient(userID, conn)
			}
		}
	}
}
