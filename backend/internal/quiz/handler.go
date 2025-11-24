package quiz

import (
	"encoding/json"
	"net/http"
	"quiz_backend/internal/session"
	"quiz_backend/models"
	"quiz_backend/pkg/response"
	"strconv"
	"strings"
)

type QuizHandlerDeps struct {
	QuizRepository *QuizRepository
	SessionService *session.Service
	QuizService    *QuizService
}

type QuizHandler struct {
	repo        *QuizRepository
	sess        *session.Service
	quizService *QuizService
}

func NewQuizHandler(mux *http.ServeMux, deps QuizHandlerDeps) {
	h := &QuizHandler{
		repo:        deps.QuizRepository,
		sess:        deps.SessionService,
		quizService: deps.QuizService,
	}

	// Questions
	mux.HandleFunc("GET /api/v1/questions", h.GetAllQuestions())
	mux.HandleFunc("GET /api/v1/questions/{id}", h.GetQuestion())

	// Quiz
	mux.HandleFunc("GET /api/v1/quiz/check-session", h.CheckSession())
	mux.HandleFunc("GET /api/v1/quiz/start", h.StartQuiz())
	mux.HandleFunc("POST /api/v1/quiz/answer", h.SubmitAnswer())
}

// GetAllQuestions godoc
// @Summary      List questions with pagination and search
// @Tags         questions
// @Accept       json
// @Produce      json
// @Param        search  query  string  false  "Search in text"
// @Param        page     query  int     false  "Page number"     default(1)
// @Param        limit    query  int     false  "Items per page"  default(10)
// @Success      200 {object} models.QuestionsDTO
// @Router       /questions [get]
func (h *QuizHandler) GetAllQuestions() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		search := strings.TrimSpace(r.URL.Query().Get("search"))
		page := 1
		limit := 10

		if p := r.URL.Query().Get("page"); p != "" {
			if n, err := strconv.Atoi(p); err == nil && n > 0 {
				page = n
			}
		}
		if l := r.URL.Query().Get("limit"); l != "" {
			if n, err := strconv.Atoi(l); err == nil && n > 0 {
				limit = n
			}
		}

		questions, total, pages, currentPage, err := h.repo.GetQuestions(search, page, limit)
		if err != nil {
			response.InternalError(w, "Failed to fetch questions")
			return
		}

		dto := response.ToQuestionsDTO(questions, total, pages, currentPage)
		response.OK(w, dto)
	}
}

// GetQuestion godoc
// @Summary      Get single question by ID
// @Tags         questions
// @Accept       json
// @Produce      json
// @Param        id   path   int   true   "Question ID"
// @Success      200 {object} models.QuestionDTO
// @Failure      400 {object} map[string]string
// @Failure      404 {object} map[string]string
// @Router       /questions/{id} [get]
func (h *QuizHandler) GetQuestion() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseUint(idStr, 10, 32)
		if err != nil {
			response.BadRequest(w, "Invalid ID")
			return
		}

		q, err := h.repo.GetQuestionById(uint(id))
		if err != nil {
			response.InternalError(w, "Question not found")
			return
		}

		dto := response.ToQuestionDTO(q)
		response.OK(w, dto)
	}
}

// CheckSession godoc
// @Summary      Check if already have a session
// @Tags         quiz
// @Produce      json
// @Success      200 {object} models.SessionStats
// @Failure      404 {object} map[string]string
// @Router       /quiz/check-session" [get]
func (h *QuizHandler) CheckSession() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, err := h.sess.GetOrCreateSession(w, r)
		if err != nil {
			response.InternalError(w, "Failed to start session")
			return
		}

		resp := h.quizService.GetSession(session)

		response.OK(w, resp)
	}
}

// StartQuiz godoc
// @Summary      Start or resume quiz session
// @Tags         quiz
// @Produce      json
// @Success      200 {object} models.StartResponse
// @Router       /quiz/start [get]
func (h *QuizHandler) StartQuiz() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, err := h.sess.GetSession(r)
		if err != nil {
			response.Unauthorized(w, "No active session")
			return
		}

		resp, err := h.quizService.StartQuiz(session)
		if err != nil {
			response.InternalError(w, "Failed to start quiz")
			return
		}
		response.OK(w, resp)
	}
}

// SubmitAnswer godoc
// @Summary      Submit answer for current question
// @Tags         quiz
// @Accept       json
// @Produce      json
// @Param        body  body  models.AnswerRequest  true  "Answer data"
// @Success      200 {object} models.AnswerResponse
// @Failure      400 {object} map[string]string
// @Failure      401 {object} map[string]string
// @Router       /quiz/answer [post]
func (h *QuizHandler) SubmitAnswer() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.AnswerRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.BadRequest(w, "Invalid JSON")
			return
		}

		session, err := h.sess.GetSession(r)
		if err != nil {
			response.Unauthorized(w, "No active session")
			return
		}

		if !session.HasActiveGame {
			response.BadRequest(w, "Quiz already completed")
			return
		}

		resp, err := h.quizService.ProcessAnswer(session, req.Answer)
		if err != nil {
			response.InternalError(w, "Failed to process answer")
			return
		}

		response.OK(w, resp)
	}
}
