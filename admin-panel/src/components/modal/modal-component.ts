import { Component, computed, inject } from "angular";
import { ModalService } from "./modal-service";

@Component({
  selector: "app-modal",
  templateUrl: "/src/components/modal/modal-template.html",
})
export class Modal {
  private modalService = inject(ModalService);
  isModalOpen = computed(() => this.modalService.isModalOpen(), this);
  editQuestionId = computed(() => this.modalService.editQuestionId(), this);
  editQuestionText = computed(() => this.modalService.questionText(), this);
  editQuestionOptions = computed(() => this.modalService.questionOptions(), this);

  close() {
    this.modalService.close();
  }

  selectAnswer(e: Event) {
    this.modalService.selectAnswer(e);
  }

  changeQuestion(e: Event) {
    this.modalService.changeQuestion(e);
  }

  getNumber(num: number) {
    return num + 1;
  }

  changeAnswer(e: Event) {
    this.modalService.changeAnswer(e);
  }

  checkSelected(idx: number) {
    return this.modalService.answerId() === idx;
  }

  submitForm(e: Event) {
    e.preventDefault();
    this.modalService.submit();
  }
}
