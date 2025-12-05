import { QuizService } from "@/app/quiz-service";
import { Component, computed, inject } from "angular";

@Component({
  selector: "app-start",
  templateUrl: "/src/components/start/start-template.html",
})
export class StartComponent {
  private quizService = inject(QuizService);
  buttonText = computed(
    () => (this.quizService.haveActiveSession() ? "Next Game" : "Start Game"),
    this,
  );
  hasResultStatistic = computed(
    () => this.quizService.haveActiveSession() && !this.quizService.gameState()?.isGameActive,
    this,
  );

  start() {
    this.quizService.start();
  }
}
