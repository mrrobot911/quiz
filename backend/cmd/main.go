package main

import (
	"fmt"
	"log"
	"net/http"
	_ "quiz_backend/docs"
	"quiz_backend/internal/quiz"
	"quiz_backend/internal/session"
	"quiz_backend/models"
	"quiz_backend/pkg/db"
	"quiz_backend/pkg/middleware"

	"github.com/joho/godotenv"
	httpSwagger "github.com/swaggo/http-swagger/v2"
)

// @title           Quiz API
// @version         1.0
// @description     Clean Architecture Quiz Backend
// @host            localhost:5000
// @BasePath        /api/v1
func main() {
	_ = godotenv.Load()

	conn := db.ConnectDb()

	conn.Migrator().DropTable(&models.Question{}, &models.UserSession{})
	if err := conn.AutoMigrate(&models.Question{}, &models.UserSession{}); err != nil {
		log.Fatal("Migration failed:", err)
	}

	if err := conn.SeedQuiz(); err != nil {
		log.Println("Warning: Seed failed (run once):", err)
	} else {
		log.Println("Database seeded")
	}

	mux := http.NewServeMux()

	mux.Handle("/swagger/", httpSwagger.Handler(
		httpSwagger.URL("/docs/swagger.json"),
		httpSwagger.DeepLinking(true),
		httpSwagger.DocExpansion("list"),
	))

	mux.HandleFunc("/docs/swagger.json", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "docs/swagger.json")
	})

	repo := quiz.NewQuizRepository(conn)

	sessionSvc := session.NewService(repo)
	quizSvc := quiz.NewQuizService(repo)

	quiz.NewQuizHandler(mux, quiz.QuizHandlerDeps{
		QuizRepository: repo,
		SessionService: sessionSvc,
		QuizService:    quizSvc,
	})

	chain := middleware.CreateMiddlewareChain(middleware.CorsMiddleware)

	server := &http.Server{
		Addr:    ":5000",
		Handler: chain(mux),
	}

	fmt.Println("Server running: http://localhost:5000")
	fmt.Println("Swagger UI:    http://localhost:5000/swagger/")
	log.Fatal(server.ListenAndServe())
}
