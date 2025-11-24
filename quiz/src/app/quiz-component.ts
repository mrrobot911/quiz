import { Component, computed, inject, type OnInit } from "@angular";
import { ToastService } from "../components/toast/toast-service";
import { QuizService } from "./quiz-service";

@Component({
    selector: 'app-quiz',
    templateUrl: '/src/app/quiz-template.html'
})
export class QuizComponent implements OnInit {
    private quizService = inject(QuizService);
    private toastService = inject(ToastService);

    isActive = computed(() => this.quizService.gameState()?.isGameActive, this);

    onInit(): void {
        this.quizService.init().then(isActive => isActive && this.start()).catch(error => this.toastService.error(error));
    }

    start() {
        this.quizService.start().catch(error => this.toastService.error(error));
    }
}
