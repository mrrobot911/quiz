package response

import (
	"quiz_backend/models"
)

func ToAdminPanelQuestionDTO(q *models.Question) models.AdminPanelQuestionDTO {
	return models.AdminPanelQuestionDTO{
		ID:            q.ID,
		Text:          q.Text,
		Options:       q.Options,
		CorrectAnswer: q.CorrectAnswer,
	}
}

func ToAdminPanelQuestionsDTO(questions []models.Question, total, pages int64, page int) models.AdminPanelQuestionsDTO {
	dtos := make([]models.AdminPanelQuestionDTO, len(questions))
	for i := range questions {
		dtos[i] = ToAdminPanelQuestionDTO(&questions[i])
	}
	return models.AdminPanelQuestionsDTO{
		Questions: dtos,
		Total:     total,
		Pages:     pages,
		Page:      page,
	}
}

func ToQuestionDTO(q *models.Question) models.QuestionDTO {
	return models.QuestionDTO{
		ID:        q.ID,
		Text:      q.Text,
		Options:   q.Options,
		TimeLimit: models.QuestionTimeLimit,
	}
}

func ToCheckResponse(session *models.UserSession) models.SessionStats {
	return models.SessionStats{
		CurrentIndex:   session.CurrentIndex,
		HasActiveGame:  session.HasActiveGame,
		TotalCorrect:   session.CorrectAnswers,
		TotalIncorrect: session.IncorrectAnswers,
	}
}

func ToAnswerResponse(correct bool, answerIdx int, reason string, session *models.UserSession, nextQ *models.Question) models.AnswerResponse {
	var dto *models.QuestionDTO
	if nextQ != nil {
		q := ToQuestionDTO(nextQ)
		dto = &q
	}
	return models.AnswerResponse{
		Correct: correct,
		Reason:  reason,
		Answer:  answerIdx,
		SessionStats: models.SessionStats{
			CurrentIndex:   session.CurrentIndex,
			HasActiveGame:  session.HasActiveGame,
			TotalCorrect:   session.CorrectAnswers,
			TotalIncorrect: session.IncorrectAnswers,
		},
		NextQuestion: dto,
	}
}

func ToStartResponse(timeLimit int, session *models.UserSession, nextQ *models.Question) models.StartResponse {
	var dto *models.QuestionDTO
	if nextQ != nil {
		q := ToQuestionDTO(nextQ)
		dto = &q
		dto.TimeLimit = timeLimit
	}
	return models.StartResponse{
		SessionStats: models.SessionStats{
			CurrentIndex:   session.CurrentIndex,
			HasActiveGame:  session.HasActiveGame,
			TotalCorrect:   session.CorrectAnswers,
			TotalIncorrect: session.IncorrectAnswers,
		},
		NextQuestion: dto,
	}
}
