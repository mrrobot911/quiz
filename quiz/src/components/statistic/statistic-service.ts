import { QuizService } from "@/app/quiz-service";
import { inject, Injectable } from "@angular";

@Injectable()
export class StatisticService {
    private quizService = inject(QuizService);
    stat = this.quizService.gameState;
}