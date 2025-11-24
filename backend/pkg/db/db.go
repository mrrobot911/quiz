package db

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"quiz_backend/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Db struct {
	*gorm.DB
}

func ConnectDb() *Db {
	db, err := gorm.Open(sqlite.Open("quiz.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database. \n", err)
		os.Exit(2)
	}

	log.Println("connected db")

	return &Db{
		db,
	}
}

func (db *Db) Migrate() {
	db.AutoMigrate(&models.Question{}, &models.UserSession{})
	log.Println("Database Migration Completed...")
}

func (db *Db) SeedQuiz() error {
	path := filepath.Join(".", "pkg", "db", "questions.json")
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	var questions []models.Question
	if err := json.Unmarshal(data, &questions); err != nil {
		return err
	}

	for _, question := range questions {
		if err := db.Create(&question).Error; err != nil {
			return err
		}
	}

	log.Println("Database seeded successfully!")
	return nil
}
