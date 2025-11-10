package helper

import (
	"fmt"
	"math/rand"
	"time"
)

func RandomHexColor() string {
	// bikin random generator baru dengan seed dari waktu
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	// generate angka antara 0x000000 sampai 0xFFFFFF
	color := r.Intn(0xFFFFFF + 1)

	// format ke hex string dengan 6 digit
	return fmt.Sprintf("#%06X", color)
}
