package test

import (
	"be-app/internal/app/domain/friend"
	"be-app/internal/app/domain/user"
	userprofile "be-app/internal/app/domain/user_profile"
	"be-app/internal/dto"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func seedUserAndProfile(t *testing.T) (user.User, user.User, user.User) {
	repoUser := user.NewRepo()
	repoProfile := userprofile.NewRepo()

	user1 := user.User{
		ID:       uuid.NewString(),
		Email:    "san@gm.com",
		Password: "rahasia",
	}
	user2 := user.User{
		ID:       uuid.NewString(),
		Email:    "san2@gm.com",
		Password: "rahasia",
	}
	user3 := user.User{
		ID:       uuid.NewString(),
		Email:    "san3@gm.com",
		Password: "rahasia",
	}
	require.NoError(t, repoUser.NewUser(db, &user1))
	require.NoError(t, repoUser.NewUser(db, &user2))
	require.NoError(t, repoUser.NewUser(db, &user3))

	profile1 := userprofile.UserProfile{
		ID:        uuid.NewString(),
		UserID:    user1.ID,
		Name:      "san",
		Username:  "san",
		Birthdate: time.Now(),
	}
	profile2 := userprofile.UserProfile{
		ID:        uuid.NewString(),
		UserID:    user2.ID,
		Name:      "san2",
		Username:  "san2",
		Birthdate: time.Now(),
	}
	profile3 := userprofile.UserProfile{
		ID:        uuid.NewString(),
		UserID:    user3.ID,
		Name:      "san3",
		Username:  "san3",
		Birthdate: time.Now(),
	}

	require.NoError(t, repoProfile.Create(db, &profile1))
	require.NoError(t, repoProfile.Create(db, &profile2))
	require.NoError(t, repoProfile.Create(db, &profile3))

	return user1, user2, user3
}
func TestGetListByUserId(t *testing.T) {
	repoFriend := friend.NewRepo()
	u1, u2, u3 := seedUserAndProfile(t)

	err := repoFriend.NewFriendRequest(db, &friend.Friend{
		ID:         uuid.NewString(),
		SenderId:   u2.ID,
		ReceiverId: u1.ID,
		IsPending:  false,
	})
	assert.Nil(t, err)

	err = repoFriend.NewFriendRequest(db, &friend.Friend{
		ID:         uuid.NewString(),
		SenderId:   u1.ID,
		ReceiverId: u3.ID,
		IsPending:  true,
	})
	assert.Nil(t, err)

	list := []dto.FriendList{}
	// mencari list teman user1
	err = repoFriend.GetListByUserId(db, u1.ID, &list)
	assert.Nil(t, err)

	bytes, err := json.MarshalIndent(list, "", "  ")
	assert.Nil(t, err)
	fmt.Println(string(bytes))
}

func TestGetListSentByUserId(t *testing.T) {
	repoF := friend.NewRepo()
	u1, u2, u3 := seedUserAndProfile(t)

	err := repoF.NewFriendRequest(db, &friend.Friend{
		ID:         uuid.NewString(),
		SenderId:   u1.ID,
		ReceiverId: u2.ID,
		IsPending:  false,
	})
	assert.Nil(t, err)

	err = repoF.NewFriendRequest(db, &friend.Friend{
		ID:         uuid.NewString(),
		SenderId:   u1.ID,
		ReceiverId: u3.ID,
		IsPending:  true,
	})
	assert.Nil(t, err)

	list := []dto.FriendList{}
	err = repoF.GetListSentByUserId(db, u1.ID, &list)
	assert.Nil(t, err)

	bytes, err := json.MarshalIndent(list, "", "  ")
	assert.Nil(t, err)
	fmt.Println(string(bytes))
}

func TestGetListRequestByUserId(t *testing.T) {
	repoF := friend.NewRepo()
	u1, u2, u3 := seedUserAndProfile(t)

	err := repoF.NewFriendRequest(db, &friend.Friend{
		ID:         uuid.NewString(),
		SenderId:   u1.ID,
		ReceiverId: u2.ID,
		IsPending:  true,
	})
	assert.Nil(t, err)

	err = repoF.NewFriendRequest(db, &friend.Friend{
		ID:         uuid.NewString(),
		SenderId:   u1.ID,
		ReceiverId: u3.ID,
		IsPending:  true,
	})
	assert.Nil(t, err)

	err = repoF.NewFriendRequest(db, &friend.Friend{
		ID:         uuid.NewString(),
		SenderId:   u2.ID,
		ReceiverId: u3.ID,
		IsPending:  true,
	})
	assert.Nil(t, err)

	list := []dto.FriendList{}
	err = repoF.GetListRequestByUserId(db, u3.ID, &list)
	assert.Nil(t, err)

	bytes, err := json.MarshalIndent(list, "", "  ")
	assert.Nil(t, err)
	fmt.Println(string(bytes))
}

func TestRemoveRequest(t *testing.T) {
	repoF := friend.NewRepo()
	u1, u2, u3 := seedUserAndProfile(t)

	err := repoF.NewFriendRequest(db, &friend.Friend{
		ID:         uuid.NewString(),
		SenderId:   u1.ID,
		ReceiverId: u2.ID,
		IsPending:  true,
	})
	assert.Nil(t, err)

	err = repoF.NewFriendRequest(db, &friend.Friend{
		ID:         uuid.NewString(),
		SenderId:   u1.ID,
		ReceiverId: u3.ID,
		IsPending:  true,
	})
	assert.Nil(t, err)

	err = repoF.NewFriendRequest(db, &friend.Friend{
		ID:         uuid.NewString(),
		SenderId:   u2.ID,
		ReceiverId: u3.ID,
		IsPending:  true,
	})
	assert.Nil(t, err)

	list := []dto.FriendList{}
	err = repoF.GetListRequestByUserId(db, u3.ID, &list)
	assert.Nil(t, err)

	bytes, err := json.MarshalIndent(list, "", "  ")
	assert.Nil(t, err)
	fmt.Println(string(bytes))

	err = repoF.RemoveRequest(db, u1.ID, u3.ID)
	assert.Nil(t, err)

	fmt.Println("second==")
	err = repoF.GetListRequestByUserId(db, u3.ID, &list)
	assert.Nil(t, err)

	bytes, err = json.MarshalIndent(list, "", "  ")
	assert.Nil(t, err)
	fmt.Println(string(bytes))
}
