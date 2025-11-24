package session

import (
	"net/http"
	"quiz_backend/models"
)

type SessionRepository interface {
	CreateSession() (*models.UserSession, error)
	GetActiveSessionByToken(token string) (*models.UserSession, error)
	GetSessionByToken(token string) (*models.UserSession, error)
	UpdateSession(s *models.UserSession) error
	GetQuestionById(id uint) (*models.Question, error)
}

type Service struct {
	repo SessionRepository
}

func NewService(repo SessionRepository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetOrCreateSession(w http.ResponseWriter, r *http.Request) (*models.UserSession, error) {
	if cookie, err := r.Cookie("quiz_session"); err == nil {
		if sess, err := s.repo.GetActiveSessionByToken(cookie.Value); err == nil {
			return sess, nil
		}
		s.clearSessionCookie(w)
	}

	return s.createNewSession(w)
}

func (s *Service) GetSession(r *http.Request) (*models.UserSession, error) {
	cookie, err := r.Cookie("quiz_session")
	if err != nil {
		return nil, err
	}
	return s.repo.GetSessionByToken(cookie.Value)
}

func (s *Service) createNewSession(w http.ResponseWriter) (*models.UserSession, error) {
	session, err := s.repo.CreateSession()
	if err != nil {
		return nil, err
	}

	s.setSessionCookie(w, session.SessionToken)
	return session, nil
}

func (s *Service) setSessionCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "quiz_session",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   86400,
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	})
}

func (s *Service) clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "quiz_session",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	})
}
