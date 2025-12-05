import { AdminPanelService } from "@/app/admin-service";
import { DEFAULT_QUESTION } from "@/shared/constants";
import { inject, Injectable } from "angular";

Injectable();
export class ModalService {
  private adminPanelService = inject(AdminPanelService);
  isModalOpen = this.adminPanelService.isOpenModal;
  answerId = () => this.adminPanelService.editQuestion().answer.id;
  editQuestionId = () => {
    const id = this.adminPanelService.editQuestion().id;
    return id ? `You edit question with id ${id}` : `You create new question`;
  };
  questionText = () => this.adminPanelService.editQuestion().text;
  questionOptions = () => this.adminPanelService.editQuestion().options;

  close() {
    this.adminPanelService.editQuestion(DEFAULT_QUESTION);
    this.adminPanelService.isOpenModal(false);
  }

  selectAnswer(e: Event) {
    const element = e.target;
    if (!(element instanceof HTMLSelectElement)) {
      console.warn("Target is not a select element");
      return;
    }
    const prevQuestion = this.adminPanelService.editQuestion();
    const id = prevQuestion.options.findIndex((q) => q === element.value);
    const question = {
      ...prevQuestion,
      answer: {
        id,
        text: element.value,
      },
    };
    this.adminPanelService.editQuestion.set(question);
  }

  changeQuestion(e: Event) {
    const element = e.target;
    if (!(element instanceof HTMLTextAreaElement)) {
      console.warn("Target is not a select element");
      return;
    }
    const prevQuestion = this.adminPanelService.editQuestion();
    const question = {
      ...prevQuestion,
      text: element.value,
    };
    this.adminPanelService.editQuestion.set(question);
  }

  changeAnswer(e: Event) {
    const element = e.target;
    if (!(element instanceof HTMLInputElement)) {
      console.warn("Target is not a select element");
      return;
    }
    const prevQuestion = this.adminPanelService.editQuestion();
    const id = Number.parseInt(element.id, 10);
    const question = {
      ...prevQuestion,
      options: prevQuestion.options.map((el, idx) => (idx === id ? element.value : el)),
    };
    this.adminPanelService.editQuestion.set(question);
  }

  checkSelected(idx: number) {
    const question = this.adminPanelService.editQuestion();
    return question?.answer.id === idx;
  }

  submit() {
    this.adminPanelService.submit();
  }
}
