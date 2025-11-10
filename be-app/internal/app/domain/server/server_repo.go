package server


import (
	"be-app/internal/dto"
	"be-app/internal/errs"

	"gorm.io/gorm"
)

type Repo struct {
}

func NewRepo() Repo {
	return Repo{}
}

func (r Repo) NewServer(db *gorm.DB, server *Server) error {
	return db.Create(server).Error
}

func (r Repo) NewBatchServer(db *gorm.DB, server []*Server) error {
	return db.Create(server).Error
}

func (r Repo) GetById(db *gorm.DB, server_id string, server *Server) error {
	return db.Where("id = ?", server_id).First(server).Error
}

func (r Repo) ServerInviteByCode(db *gorm.DB, code string, data *dto.ServerInvite) error {
	query := `
		SELECT 
		s.id,
		s.name,
		s.profile_image,
		COUNT(DISTINCT j.user_id) AS total_member,
		COUNT(DISTINCT CASE WHEN up.status_activity != 'Invisible' THEN up.user_id END) AS total_online
		FROM server s
		JOIN join_server j ON j.server_id = s.id
		LEFT JOIN user_profile up ON up.user_id = j.user_id
		WHERE s.invite_code = ? 
		GROUP BY s.id, s.name;
	`

	err := db.Raw(query, code).Scan(&data).Error
	if err != nil {
		return err
	}

	if data.ID == "" { // atau field lain yang pasti ada kalau data valid
		return errs.ErrServerNotFound
	}

	return nil
}
