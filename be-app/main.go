package main

import (
	"be-app/configs"
	"be-app/internal/route"
	"fmt"
	"log"
	"os"
)

func main() {
	configs.LoadEnv()
	server := configs.NewFiber()
	configs.NewDB()

	route.SetupRoutes(server)
	log.Fatal(server.Listen(fmt.Sprintf(":%s", os.Getenv("APP_PORT"))))
}
