package core

import (
	"github.com/omnistrate-community/ai-chatbot/pkg/db"
	"github.com/omnistrate-community/ai-chatbot/pkg/model/tenant"
	"time"
)

type MessageType string

const (
	MessageTypeQuery    MessageType = "query"
	MessageTypeResponse MessageType = "response"
)

type Thread struct {
	ID        string      `gorm:"primaryKey"`
	CreatedAt time.Time   `gorm:"autoCreateTime"`
	UpdatedAt time.Time   `gorm:"autoUpdateTime"`
	Name      string      `gorm:"index"`
	UserID    string      `gorm:"index"`
	User      tenant.User `gorm:"foreignKey:UserID" json:"-"`
}

type Message struct {
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	MessageID   string    `gorm:"primaryKey"`
	ThreadID    string    `gorm:"index"`
	Thread      Thread    `gorm:"foreignKey:ThreadID" json:"-"`
	Content     string
	MessageType MessageType `gorm:"index"`
}

func Initialize() error {
	return db.Connect().AutoMigrate(
		&Thread{},
		&Message{},
	)
}

func (t *Thread) Save() error {
	return db.Connect().Save(t).Error
}

func (t *Thread) GetMessages() ([]Message, error) {
	var messages []Message
	err := db.Connect().Model(&Message{}).Where("thread_id = ?", t.ID).Find(&messages).Error
	return messages, err
}

func GetThreadsForUser(userID string) ([]Thread, error) {
	var threads []Thread
	err := db.Connect().Where("user_id = ?", userID).Find(&threads).Error
	return threads, err
}

func GetThreadByID(threadID string, userID string) (Thread, error) {
	var thread Thread
	err := db.Connect().Where("id = ?", threadID).Where("user_id = ?", userID).First(&thread).Error
	return thread, err
}

func (m *Message) Save() error {
	return db.Connect().Model(&Message{}).Where(m).Save(m).Error
}
