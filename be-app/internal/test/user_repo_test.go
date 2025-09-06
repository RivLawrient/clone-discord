package test

import (
	"be-app/internal/app/domain/user"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

// func setupTestDB(t *testing.T) *gorm.DB {
// 	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
// 	require.NoError(t, err)

// 	err = db.AutoMigrate(&user.User{})
// 	require.NoError(t, err)

// 	return db
// }

func TestNewUser(t *testing.T) {
	repo := user.NewRepo()

	data := user.User{
		ID:       uuid.NewString(),
		Email:    "test@gm.com",
		Password: "rahasia",
	}
	err := repo.NewUser(db, &data)
	assert.NoError(t, err)

	// t.Run("check email", func(t *testing.T) {
	// err = repo.CheckEmailDuplicate(db, "test@gm.com")
	// assert.Equal(t, errs.ErrEmailUsed, err)
	// })
}
