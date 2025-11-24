import { inject, Injectable, signal } from "@angular";
import { NEGATIVE_ANSWER } from "../../shared/constants";
import { QuizService } from "@/app/quiz-service";

interface IState {
    selected: number,
    canSubmit: boolean,
    isSubmiting: boolean,
}

const defaultState = {
    selected: NEGATIVE_ANSWER,
    canSubmit: false,
    isSubmiting: false,
}

Injectable()
export class QuestionService {
    private quizService = inject(QuizService);
    state = signal<IState>(defaultState);
    question = this.quizService.currentQuestion;
    correctAnswer = this.quizService.correctAnswer;
    isActive = this.quizService.isActive;

    select(answerIdx: number) {
        const { selected } = this.state();
        if (!this.isActive()) return;

        const newSelected = selected === answerIdx ? NEGATIVE_ANSWER : answerIdx;
        this.setState({ selected: newSelected, canSubmit: newSelected !== NEGATIVE_ANSWER });
    }

    submit() {
        const { selected, canSubmit, isSubmiting } = this.state();
        if (!canSubmit && isSubmiting && this.isActive()) return;
        this.setState({
            isSubmiting: true,
        });
        this.quizService.answer(selected).then(() => this.setState(defaultState));
    }

    destroy() {
        this.state(defaultState);
    }

    private setState(updates: Partial<IState>) {
        const current = this.state();

        this.state.set({
            ...current,
            ...updates,
        });
    }
}