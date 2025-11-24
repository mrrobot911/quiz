import { Component, computed, inject } from "@angular";
import { QuizService } from "@/app/quiz-service";

@Component({
    selector: 'app-header',
    templateUrl: '/src/components/header/header-template.html',
})
export class HeaderComponent {
    private quizService = inject(QuizService);

    activeSession = computed(() => this.quizService.haveActiveSession(), this);
    isGameActive = computed(() => this.quizService.gameState()?.isGameActive, this);
}