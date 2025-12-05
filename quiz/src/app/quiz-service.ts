import { ApiService } from "../services/api-service";
import { TimerService } from "../components/timer/timer-service";
import { NEGATIVE_ANSWER, TIMEOUT_DELAY } from "../shared/constants";
import { inject, Injectable, signal } from "angular";
import type { IAnswer, IQuestion, IStats } from "@/shared/types.js";
import { ToastService } from "@/components/toast/toast-service";

interface IGameState {
  isGameActive: boolean;
  correctAnswers: number;
  incorrectAnswers: number;
  currentQuestionNumber: number;
}

interface IQuestionState extends Omit<IQuestion, "time_limit"> {
  timeLimit: number;
}

Injectable();
export class QuizService {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private timerService = inject(TimerService);
  gameState = signal<IGameState | null>(null);
  currentQuestion = signal<IQuestionState | null>(null);
  correctAnswer = signal<number | null>(null);
  haveActiveSession = signal(false);
  isActive = this.timerService.isActive;

  init() {
    return this.apiService.getSession().then((resp) => resp.has_active_game);
  }

  start() {
    return this.apiService.startQuiz().then((resp) => {
      this.updateGameState(resp);
      if (resp.next_question) {
        this.updateQuestionState(resp.next_question);
        this.timerService.start(resp.next_question.time_limit);
      }
    });
  }

  answer(index: number) {
    const currentNumber = this.gameState()?.currentQuestionNumber || 0;
    const questionId = this.currentQuestion()?.id || 0;
    const timerValue = this.timerService.time();

    const currentIndex = timerValue && timerValue <= 0 ? NEGATIVE_ANSWER : index;
    this.timerService.stop();

    return this.apiService.postAnswer(currentIndex, currentNumber, questionId).then((resp) => {
      if (!resp.has_active_game) {
        this.updateFinalGameState(resp);
        this.haveActiveSession.set(true);
      } else {
        this.updateGameState(resp);
      }
      this.correctAnswer.set(resp.correct_answer_idx);
      this.toastService.show(resp.reason);

      return new Promise((resolve) => {
        setTimeout(() => {
          if (resp.has_active_game) {
            if (resp.next_question) {
              this.updateQuestionState(resp.next_question);
              this.timerService.start(resp.next_question.time_limit);
            }
            this.correctAnswer.set(null);
          } else {
            const prevState = this.gameState();
            if (prevState) {
              this.gameState.set({
                ...prevState,
                isGameActive: false,
              });
            }
          }
          resolve(resp);
        }, TIMEOUT_DELAY);
      });
    });
  }

  private updateGameState(state: IStats) {
    const { has_active_game, total_correct, total_incorrect, current_index } = state;
    this.gameState.set({
      isGameActive: has_active_game,
      correctAnswers: total_correct,
      incorrectAnswers: total_incorrect,
      currentQuestionNumber: current_index,
    });
  }

  private updateQuestionState(state: IQuestion) {
    const { time_limit, ...rest } = state;
    this.currentQuestion.set({ ...rest, timeLimit: time_limit });
  }

  private updateFinalGameState(state: IAnswer) {
    const { correct } = state;
    const prevState = this.gameState();
    if (!prevState) return;
    const { correctAnswers, incorrectAnswers, currentQuestionNumber } = prevState;
    this.gameState.set({
      ...prevState,
      correctAnswers: correct ? correctAnswers + 1 : correctAnswers,
      incorrectAnswers: !correct ? incorrectAnswers + 1 : incorrectAnswers,
      currentQuestionNumber: currentQuestionNumber + 1,
    });
  }
}
