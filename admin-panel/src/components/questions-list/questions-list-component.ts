import { AdminPanelService } from "@/app/admin-service";
import { Component, computed, inject, type OnInit } from "angular";

@Component({
  selector: "app-questions",
  templateUrl: "/src/components/questions-list/questions-list-template.html",
})
export class QuestionsListComponent implements OnInit {
  private adminPanelService = inject(AdminPanelService);
  questions = computed(() => this.adminPanelService.questions(), this);

  onInit(): void {
    this.adminPanelService.getQuestions();
  }

  edit(id: number) {
    this.adminPanelService.setEditQuestion(id);
    this.adminPanelService.isOpenModal(true);
  }

  delete(id: number) {
    this.adminPanelService.deleteQuestion(id);
  }

  getIndex(idx: number) {
    return this.adminPanelService.getIndex(idx);
  }
}
