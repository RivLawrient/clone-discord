package main

import (
	"be-app/configs"
	"be-app/internal"
	"fmt"
	"log"
	"os"
)

func main() {
	configs.LoadEnv()
	server := configs.NewFiber()
	db := configs.NewDB()
	validate := configs.NewValidator()

	internal.Apps(&internal.AppsConfig{
		DB:       db,
		App:      server,
		Validate: validate,
	})
	log.Fatal(server.Listen(fmt.Sprintf(":%s", os.Getenv("APP_PORT"))))
}
