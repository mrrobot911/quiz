package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

const QuestionTimeLimit = 30 // seconds
const TimeGracePeriod = 2    // seconds extra for network latency
const ServerTimeLimit = QuestionTimeLimit + TimeGracePeriod

type Question struct {
	gorm.Model
	Text          string   `json:"text"`
	Options       []string `json:"options" gorm:"serializer:json"`
	CorrectAnswer int      `json:"correct_answer"`
}

type QuestionDataDTO struct {
	Text          string   `json:"text"`
	Options       []string `json:"options" gorm:"serializer:json"`
	CorrectAnswer int      `json:"correct_answer"`
}

type AdminPanelQuestionDTO struct {
	ID            uint     `json:"id"`
	Text          string   `json:"text"`
	Options       []string `json:"options"`
	CorrectAnswer int      `json:"correct_answer"`
}

type AdminPanelQuestionsDTO struct {
	Questions []AdminPanelQuestionDTO `json:"questions"`
	Pages     int64                   `json:"total_pages"`
	Total     int64                   `json:"total_count"`
	Page      int                     `json:"page"`
}

type QuestionDTO struct {
	ID        uint     `json:"id"`
	Text      string   `json:"text"`
	Options   []string `json:"options"`
	TimeLimit int      `json:"time_limit"`
}

type UserSession struct {
	gorm.Model
	SessionToken      string     `json:"session_token" gorm:"uniqueIndex"`
	StartTime         time.Time  `json:"start_time"`
	EndTime           *time.Time `json:"end_time,omitempty"`
	CorrectAnswers    int        `json:"correct_answers"`
	IncorrectAnswers  int        `json:"incorrect_answers"`
	TotalTime         int        `json:"total_time"`                       // in seconds
	Questions         []uint     `json:"questions" gorm:"serializer:json"` // IDs of 10 questions for the round
	CurrentIndex      int        `json:"current_index"`                    // index in Questions slice (0-9)
	HasActiveGame     bool       `json:"has_active_game"`
	QuestionStartTime *time.Time `json:"question_start_time,omitempty"` // when current question was issued
}

type AnswerRequest struct {
	Answer int `json:"answer"`
	Idx    int `json:"question_idx"`
	Id     int `json:"question_id"`
}

type AnswerResponse struct {
	Correct bool   `json:"correct"`
	Answer  int    `json:"correct_answer_idx"`
	Reason  string `json:"reason,omitempty"` // "timeout", "wrong_answer", "correct"
	SessionStats
	NextQuestion *QuestionDTO `json:"next_question,omitempty"`
}

type StartResponse struct {
	SessionStats
	NextQuestion *QuestionDTO `json:"next_question,omitempty"`
}

type SessionStats struct {
	CurrentIndex   int  `json:"current_index"`
	HasActiveGame  bool `json:"has_active_game"`
	TotalCorrect   int  `json:"total_correct"`
	TotalIncorrect int  `json:"total_incorrect"`
}

func (q Question) OptionsValue() (driver.Value, error) {
	return json.Marshal(q.Options)
}

func (q *Question) OptionsScan(value any) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &q.Options)
}

func (s UserSession) QuestionsValue() (driver.Value, error) {
	return json.Marshal(s.Questions)
}

func (s *UserSession) QuestionsScan(value any) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &s.Questions)
}
