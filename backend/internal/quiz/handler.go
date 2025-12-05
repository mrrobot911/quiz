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
	mux.HandleFunc("POST /api/v1/questions", h.CreateQuestion())
	mux.HandleFunc("PUT /api/v1/questions/{id}", h.UpdateQuestion())
	mux.HandleFunc("DELETE /api/v1/questions/{id}", h.DeleteQuestion())

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
// @Success      200 {object} models.AdminPanelQuestionsDTO
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

		dto := response.ToAdminPanelQuestionsDTO(questions, total, pages, currentPage)
		response.OK(w, dto)
	}
}

// GetQuestion godoc
// @Summary      Get single question by ID
// @Tags         questions
// @Accept       json
// @Produce      json
// @Param        id   path   int   true   "Question ID"
// @Success      200 {object} models.AdminPanelQuestionDTO
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

		dto := response.ToAdminPanelQuestionDTO(q)
		response.OK(w, dto)
	}
}

// CreateQuestion godoc
// @Summary      Create a new question
// @Tags         questions
// @Accept       json
// @Produce      json
// @Param        question  body  models.QuestionDataDTO  true  "Question data"
// @Success      200 {object} models.AdminPanelQuestionDTO
// @Failure      400 {object} map[string]string
// @Router       /questions [post]
func (h *QuizHandler) CreateQuestion() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.QuestionDataDTO
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.BadRequest(w, "Invalid JSON")
			return
		}

		if req.Text == "" {
			response.BadRequest(w, "Text is required")
			return
		}
		if len(req.Options) < 2 {
			response.BadRequest(w, "At least 2 options are required")
			return
		}
		if req.CorrectAnswer < 0 || req.CorrectAnswer >= len(req.Options) {
			response.BadRequest(w, "Correct answer index is invalid")
			return
		}

		question := &models.Question{
			Text:          req.Text,
			Options:       req.Options,
			CorrectAnswer: req.CorrectAnswer,
		}

		q, err := h.repo.CreateQuestion(question)
		if err != nil {
			response.InternalError(w, "Can't create question")
			return
		}
		dto := response.ToAdminPanelQuestionDTO(q)
		response.Created(w, dto)
	}
}

// UpdateQuestion godoc
// @Summary      Update question by ID
// @Tags         questions
// @Accept       json
// @Produce      json
// @Param        id        path  int             true  "Question ID"
// @Param        question  body  models.QuestionDataDTO  true  "Question data"
// @Success      200 {object} models.AdminPanelQuestionDTO
// @Failure      400 {object} map[string]string
// @Failure      404 {object} map[string]string
// @Router       /questions/{id} [put]
func (h *QuizHandler) UpdateQuestion() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseUint(idStr, 10, 32)
		if err != nil {
			response.BadRequest(w, "Invalid ID")
			return
		}

		var req models.QuestionDataDTO
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.BadRequest(w, "Invalid JSON")
			return
		}

		if req.Text == "" && req.Options == nil && req.CorrectAnswer < 0 {
			response.BadRequest(w, "No data provided for update")
			return
		}
		if len(req.Options) < 2 {
			response.BadRequest(w, "Question must have at least 2 options")
			return
		}

		updateData := &models.Question{
			Text:          req.Text,
			Options:       req.Options,
			CorrectAnswer: req.CorrectAnswer,
		}

		q, err := h.repo.UpdateQuestion(uint(id), updateData)
		if err != nil {
			response.InternalError(w, "Can't update question")
			return
		}
		dto := response.ToAdminPanelQuestionDTO(q)
		response.Created(w, dto)
	}
}

// GetQuestion godoc
// @Summary      Delete single question by ID
// @Tags         questions
// @Accept       json
// @Produce      json
// @Param        id   path   int   true   "Question ID"
// @Success      200 {object} models.AdminPanelQuestionDTO
// @Failure      400 {object} map[string]string
// @Failure      404 {object} map[string]string
// @Router       /questions/{id} [delete]
func (h *QuizHandler) DeleteQuestion() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseUint(idStr, 10, 32)
		if err != nil {
			response.BadRequest(w, "Invalid ID")
			return
		}

		q, err := h.repo.DeleteQuestion(uint(id))
		if err != nil {
			response.InternalError(w, "Question not found")
			return
		}

		dto := response.ToAdminPanelQuestionDTO(q)
		response.OK(w, dto)
	}
}

// CheckSession godoc
// @Summary      Check if already have a session
// @Tags         quiz
// @Produce      json
// @Success      200 {object} models.SessionStats
// @Failure      404 {object} map[string]string
// @Router       /quiz/check-session [get]
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
