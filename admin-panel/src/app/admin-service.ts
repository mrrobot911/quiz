import { ApiService } from "@/services/api-service";
import { DEFAULT_QUESTION, PAGE_LIMIT, PAGE_NUMBER } from "@/shared/constants";
import type { IQuestion, IQuestionDTO, IQuestionsDTO } from "@/shared/types";
import { inject, Injectable, signal } from "angular";

Injectable();
export class AdminPanelService {
  private apiService = inject(ApiService);
  questions = signal<IQuestion[] | null>(null);
  pages = signal(0);
  page = signal(PAGE_NUMBER);
  isOpenModal = signal(false);
  editQuestion = signal<IQuestion>(DEFAULT_QUESTION);

  getQuestions(page?: number) {
    this.apiService
      .getAllQuestions(page)
      .then((resp) => this.updateData(resp))
      .catch((err: unknown) => err instanceof Error && console.warn(err.message));
  }

  nextPage() {
    this.apiService
      .getAllQuestions(this.page() + 1)
      .then((resp) => this.updateData(resp))
      .catch((err: unknown) => err instanceof Error && console.warn(err.message));
  }

  prevPage() {
    this.apiService
      .getAllQuestions(this.page() - 1)
      .then((resp) => this.updateData(resp))
      .catch((err: unknown) => err instanceof Error && console.warn(err.message));
  }

  getIndex(idx: number) {
    return idx + 1 + (this.page() - 1) * PAGE_LIMIT;
  }

  setEditQuestion(id: number | null) {
    if (!id) {
      this.editQuestion.set(DEFAULT_QUESTION);
      return;
    }
    const question = this.questions()?.find((q) => q.id === id);
    this.editQuestion.set(question || DEFAULT_QUESTION);
  }

  submit() {
    const id = this.editQuestion().id;
    const body = {
      text: this.editQuestion().text,
      options: this.editQuestion().options,
      correct_answer: this.editQuestion().answer.id,
    };

    if (!id) {
      this.apiService
        .createQuestion(body)
        .then(() => {
          this.getQuestions();
          this.isOpenModal(false);
          this.editQuestion.set(DEFAULT_QUESTION);
        })
        .catch((err: unknown) => err instanceof Error && console.warn(err.message));
    } else {
      this.apiService
        .updateQuestion(id, body)
        .then((resp) => {
          const prev =
            this.questions()?.map((q) => (q.id === resp.id ? this.updateQuestion(resp) : q)) ||
            null;
          this.questions.set(prev);
          this.isOpenModal(false);
          this.editQuestion.set(DEFAULT_QUESTION);
        })
        .catch((err: unknown) => err instanceof Error && console.warn(err.message));
    }
  }

  deleteQuestion(id: number) {
    const questions = this.questions();
    let page = this.page();
    if (questions && questions.length <= 1) {
      const newPage = page - 1;
      page = newPage < 1 ? page : newPage;
    }
    this.apiService
      .deleteQuestion(id)
      .then(() => this.getQuestions(page))
      .catch((err: unknown) => err instanceof Error && console.warn(err.message));
  }

  private updateData(data: IQuestionsDTO) {
    this.updateQuestions(data.questions);
    this.pages.set(data.total_pages);
    this.page.set(data.page);
  }

  private updateQuestions(data: IQuestionDTO[]) {
    this.questions.set(data.map(this.updateQuestion));
  }

  private updateQuestion(data: IQuestionDTO) {
    const id = Number.parseInt(data.correct_answer, 10);
    return {
      ...data,
      answer: {
        id,
        text: data.options[id],
      },
    };
  }
}
