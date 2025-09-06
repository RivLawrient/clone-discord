package textchatuser

import "gorm.io/gorm"

type Repo struct {
}

func NewRepo() Repo {
	return Repo{}
}

func (r Repo) NewTextChat(db *gorm.DB, textChatUser *TextChatUser) error {
	return db.Create(textChatUser).Error
}

func (r Repo) GetAllByUser(db *gorm.DB, result *[]TextChatUser, u1 string, u2 string) error {
	return db.Model(&TextChatUser{}).
		Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			u1, u2, u2, u1,
		).
		Order("created_at").
		Find(&result).Error
}
