package main

import (
	"be-app/configs"
	"be-app/internal"
	"fmt"
	"log"
	"os"

	"github.com/go-playground/validator/v10"
)

func main() {
	configs.LoadEnv()
	server := configs.NewFiber()
	db := configs.NewDB()
	validate := configs.NewValidator()

	validator.New()
	internal.Apps(&internal.AppsConfig{
		DB:       db,
		App:      server,
		Validate: validate,
	})
	log.Fatal(server.Listen(fmt.Sprintf(":%s", os.Getenv("APP_PORT"))))
}
