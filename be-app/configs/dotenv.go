package configs

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnv() {
    err := godotenv.Load()
    if err != nil {
        log.Println("No .env file found, using system env variables")
    }
}