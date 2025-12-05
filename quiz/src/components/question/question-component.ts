import { QuestionService } from "./question-service";
import { Component, computed, inject } from "angular";

@Component({
  selector: "app-question",
  templateUrl: "/src/components/question/question-template.html",
})
export class QuestionComponent {
  private questionService = inject(QuestionService);
  options = computed(() => this.questionService.question()?.options, this);
  question = computed(() => this.questionService.question()?.text, this);
  selected = computed(() => this.questionService.state().selected, this);
  isDisabled = computed(
    () =>
      this.questionService.isActive()
        ? !this.questionService.state().canSubmit
        : this.questionService.state().isSubmiting,
    this,
  );
  isTimeout = computed(() => !this.questionService.isActive(), this);
  buttonText = computed(
    () => (!this.questionService.isActive() ? "Next question" : "Confirm answer"),
    this,
  );

  getAnswerClass(index: number): string {
    let baseClass = "questions__option";
    if (this.questionService.isActive()) {
      return this.selected() === index ? `${baseClass} questions__option--checked` : baseClass;
    }
    baseClass = `${baseClass} questions__option--disabled`;

    if (index === this.questionService.correctAnswer()) {
      return `${baseClass} questions__option--correct`;
    } else if (
      this.questionService.state().selected === index &&
      index !== this.questionService.correctAnswer()
    ) {
      return `${baseClass} questions__option--incorrect`;
    } else {
      return baseClass;
    }
  }

  select(idx: number) {
    if (!this.questionService.isActive()) return;
    this.questionService.select(idx);
  }

  submitForm(e: Event) {
    e.preventDefault();
    this.questionService.submit();
  }
}
