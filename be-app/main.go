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
	db := configs.NewDB()
	validate := configs.NewValidator()
	fiber := configs.NewFiber()

	internal.Apps(&internal.AppsConfig{
		DB:       db,
		App:      fiber,
		Validate: validate,
	})

	log.Fatal(fiber.Listen(fmt.Sprintf(":%s", os.Getenv("APP_PORT"))))
}
