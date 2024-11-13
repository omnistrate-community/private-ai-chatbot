package db

import (
	"fmt"
	"github.com/rs/zerolog/log"
	"os"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var dbHost = os.Getenv("DB_HOST")
var dbPort = os.Getenv("DB_PORT")
var dbName = os.Getenv("DB_NAME")
var dbUser = os.Getenv("DB_USER")
var dbPassword = os.Getenv("DB_PASSWORD")

var initSync sync.Once
var dbHandle *gorm.DB

func Connect() *gorm.DB {
	initSync.Do(func() {
		var err error

		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			dbHost, dbUser, dbPassword, dbName, dbPort)

		if dbHandle, err = gorm.Open(postgres.Open(dsn), &gorm.Config{}); err != nil {
			log.Fatal().Err(err).Msg("failed to connect to database")
		}
	})

	return dbHandle
}

func RegisterModel[T any](m T) error {
	return Connect().AutoMigrate(m)
}
