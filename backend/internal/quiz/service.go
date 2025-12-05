package quiz

import (
	"quiz_backend/models"
	"quiz_backend/pkg/response"
	"time"
)

type QuizService struct {
	repo *QuizRepository
}

func NewQuizService(repo *QuizRepository) *QuizService {
	return &QuizService{repo: repo}
}

func (s *QuizService) GetSession(session *models.UserSession) models.SessionStats {
	s.handleTimeout(session)
	s.repo.UpdateSession(session)
	return response.ToCheckResponse(session)
}

func (s *QuizService) StartQuiz(session *models.UserSession) (models.StartResponse, error) {
	var nextQ *models.Question
	nextQ, _ = s.repo.GetQuestionById(session.Questions[session.CurrentIndex])

	if !session.HasActiveGame {
		s.setCurrentTime(session)
	}
	session.HasActiveGame = true
	_, timeLimit := s.handleTimeout(session)

	s.repo.UpdateSession(session)
	return response.ToStartResponse(timeLimit, session, nextQ), nil
}

func (s *QuizService) ProcessAnswer(session *models.UserSession, answer int) (models.AnswerResponse, error) {
	q, err := s.repo.GetQuestionById(session.Questions[session.CurrentIndex])
	if err != nil {
		return models.AnswerResponse{}, err
	}

	timedOut, _ := s.handleTimeout(session)
	reason := ""

	correct := false

	if timedOut {
		reason = "timeout"
	} else {
		if answer == q.CorrectAnswer {
			correct = true
			reason = "correct"
			session.CorrectAnswers++
		} else if answer != -1 {
			reason = "wrong_answer"
			session.IncorrectAnswers++
		}
		session.CurrentIndex++
	}

	var nextQ *models.Question
	s.setCurrentTime(session)

	if session.HasActiveGame {
		nextQ, _ = s.repo.GetQuestionById(session.Questions[session.CurrentIndex])
	}

	s.repo.UpdateSession(session)
	return response.ToAnswerResponse(correct, q.CorrectAnswer, reason, session, nextQ), nil
}

func (s *QuizService) handleTimeout(session *models.UserSession) (timedOut bool, timeLimit int) {
	timeLimit = models.QuestionTimeLimit
	if session.QuestionStartTime == nil || !session.HasActiveGame {
		return
	}

	elapsed := int(time.Since(*session.QuestionStartTime).Seconds())
	if elapsed <= models.ServerTimeLimit {
		timeLimit = models.QuestionTimeLimit - elapsed
		return
	}

	session.IncorrectAnswers++
	session.TotalTime += elapsed
	session.CurrentIndex++

	timedOut = true

	s.setCurrentTime(session)
	return
}

func (s *QuizService) setCurrentTime(session *models.UserSession) {
	now := time.Now()
	if session.CurrentIndex >= len(session.Questions) {
		session.HasActiveGame = false
		session.QuestionStartTime = nil
		session.CurrentIndex = 0
		session.CorrectAnswers = 0
		session.IncorrectAnswers = 0
		session.EndTime = &now
	} else {
		session.QuestionStartTime = &now
	}
}
