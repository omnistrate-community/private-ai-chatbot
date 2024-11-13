package tenant

import (
	"github.com/omnistrate-community/ai-chatbot/pkg/db"
)

func Initialize() error {
	return db.Connect().AutoMigrate(
		&User{},
		&Org{},
	)
}

type User struct {
	ID    string `gorm:"primaryKey"`
	Email string `gorm:"unique"`
	Name  string `gorm:"index"`
	OrgID string `gorm:"index"`
	Org   Org    `gorm:"foreignKey:OrgID" json:"-"`

	// Add your custom per-tenant user schema here
}

func (u User) Save() error {
	return db.Connect().Save(u).Error
}

type Org struct {
	ID               string `gorm:"primaryKey"`
	Name             string `gorm:"index"`
	LegalCompanyName string
	Description      string
	LogoURL          string
	WebsiteURL       string

	// Add your custom per-tenant org schema here
}

func (o Org) Save() error {
	return db.Connect().Save(o).Error
}

// Add any other tenant-related models here
