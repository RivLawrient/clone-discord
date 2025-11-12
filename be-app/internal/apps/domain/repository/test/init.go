package test

import (
	"be-app/internal/apps/domain/entity"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func SetupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to test db: %v", err)
	}

	db.AutoMigrate(
		&entity.User{},
		&entity.UserProfile{},
		&entity.RefreshToken{},
		&entity.Server{},
		&entity.JoinServer{},
	)
	return db
}
