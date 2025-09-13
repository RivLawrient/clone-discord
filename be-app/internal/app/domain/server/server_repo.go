package server

import "gorm.io/gorm"

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
