package quiz

import (
	"crypto/rand"
	"encoding/hex"
	mrand "math/rand"
	"quiz_backend/models"
	"quiz_backend/pkg/db"
	"time"
)

type QuizRepository struct {
	Database *db.Db
}

func NewQuizRepository(database *db.Db) *QuizRepository {
	return &QuizRepository{Database: database}
}

func (repo *QuizRepository) GetQuestions(query string, page int, limit int) ([]models.Question, int64, int64, int, error) {
	var questions []models.Question
	var total int64

	offset := (page - 1) * limit
	db := repo.Database.DB.Model(&models.Question{})

	if query != "" {
		db = db.Where("text LIKE ?", "%"+query+"%")
	}

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, 0, 0, err
	}

	pages := (total + int64(limit) - 1) / int64(limit)
	if err := db.Offset(offset).Limit(limit).Find(&questions).Error; err != nil {
		return nil, 0, 0, 0, err
	}

	return questions, total, pages, page, nil
}

func (repo *QuizRepository) GetQuestionById(id uint) (*models.Question, error) {
	var q models.Question
	if err := repo.Database.DB.First(&q, id).Error; err != nil {
		return nil, err
	}
	return &q, nil
}

func (repo *QuizRepository) GetRandomQuestions(count int) ([]models.Question, error) {
	var questions []models.Question
	var total int64
	repo.Database.DB.Model(&models.Question{}).Count(&total)
	if total == 0 {
		return nil, nil
	}

	var ids []uint
	repo.Database.DB.Model(&models.Question{}).Pluck("id", &ids)
	mrand.Shuffle(len(ids), func(i, j int) { ids[i], ids[j] = ids[j], ids[i] })
	if len(ids) > count {
		ids = ids[:count]
	}

	repo.Database.DB.Where("id IN ?", ids).Find(&questions)
	return questions, nil
}

func (repo *QuizRepository) CreateSession() (*models.UserSession, error) {
	token := generateSessionToken()
	questions, err := repo.GetRandomQuestions(10)
	if err != nil {
		return nil, err
	}
	var qids []uint
	for _, q := range questions {
		qids = append(qids, q.ID)
	}

	session := &models.UserSession{
		SessionToken: token,
		StartTime:    time.Now(),
		Questions:    qids,
		CurrentIndex: 0,
	}

	if err := repo.Database.Create(session).Error; err != nil {
		return nil, err
	}
	return session, nil
}

func (repo *QuizRepository) GetSessionByToken(token string) (*models.UserSession, error) {
	var s models.UserSession
	err := repo.Database.DB.Where("session_token = ?", token).First(&s).Error
	return &s, err
}

func (repo *QuizRepository) GetActiveSessionByToken(token string) (*models.UserSession, error) {
	var s models.UserSession
	err := repo.Database.DB.Where("session_token = ? AND has_active_game = ?", token, true).First(&s).Error
	return &s, err
}

func (repo *QuizRepository) UpdateSession(s *models.UserSession) error {
	return repo.Database.DB.Save(s).Error
}

func generateSessionToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}
