package test

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/apps/domain/repository"
	"encoding/json"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestServerRepo_Create_Success(t *testing.T) {
	db := SetupTestDB(t)
	repo := repository.NewServerRepo()

	server := &entity.Server{
		ID:         "asdf",
		Name:       "sdf",
		InviteCode: "anu",
	}

	err := repo.Create(db, server)
	assert.NoError(t, err)

	bytes, _ := json.MarshalIndent(server, "", " ")
	fmt.Println(string(bytes))

}
