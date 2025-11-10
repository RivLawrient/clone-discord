package messagechannel

import "gorm.io/gorm"

type Repo struct{}

func NewRepo() Repo {
	return Repo{}
}

func (r Repo) NewChat(db *gorm.DB, msg *MessageChannel) error {
	return db.Create(msg).Error
}

func (r Repo) ListByChannelId(db *gorm.DB, channelId string, list *[]MessageChannel) error {
	return db.Where("channel_id = ?", channelId).Find(list).Error
}

