package videoconversation

import (
	"be-app/internal/apps/domain/entity"
	"be-app/internal/apps/domain/repository"
	"log"
	"os"
	"time"

	"github.com/livekit/protocol/auth"
	"gorm.io/gorm"
)

type Service struct {
	DB              *gorm.DB
	UserProfileRepo repository.UserProfileRepo
}

func NewService(db *gorm.DB, userProfileRepo repository.UserProfileRepo) *Service {
	return &Service{
		DB:              db,
		UserProfileRepo: userProfileRepo,
	}
}

func (s *Service) GenerateTokenLiveKit(userID, channelID string) (*string, error) {
	var livekitApiKey = os.Getenv("LIVEKIT_API_KEY")
	var livekitApiSecret = os.Getenv("LIVEKIT_API_SECRET")

	user := entity.UserProfile{}
	if err := s.UserProfileRepo.GetByUserID(s.DB, userID, &user); err != nil {
		return nil, err
	}

	at := auth.NewAccessToken(livekitApiKey, livekitApiSecret)
	grant := &auth.VideoGrant{
		RoomJoin: true,
		Room:     channelID,
	}
	log.Println("APIKEYYYYYYYYYYYYYYla", livekitApiKey)
	log.Println("apisecrettttttttttttt", livekitApiSecret)
	// at.AddGrant(grant).SetIdentity(userID).SetValidFor(time.Hour)

	at.SetVideoGrant(grant).SetIdentity(user.Username).SetValidFor(time.Hour)

	token, err := at.ToJWT()
	log.Println(err)
	return &token, nil
}
