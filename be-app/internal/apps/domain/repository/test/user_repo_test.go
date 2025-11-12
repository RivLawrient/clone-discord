package test

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/apps/domain/repository"
	"encoding/json"
	"fmt"

	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUserRepository_Create(t *testing.T) {
	db := SetupTestDB(t)
	repo := repository.NewUserRepo()

	user := &entity.User{
		ID:       "uuid-test",
		Email:    "test@example.com",
		Password: "hashed123",
	}

	err := repo.Create(db, user)
	assert.NoError(t, err)

	var found entity.User
	db.First(&found, "email = ?", user.Email)
	assert.Equal(t, "test@example.com", found.Email)

	bytes, _ := json.MarshalIndent(user, "", " ")
	fmt.Println(string(bytes))
}
