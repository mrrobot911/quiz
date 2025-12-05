import { AdminPanelService } from "@/app/admin-service";
import { Component, computed, inject } from "angular";

@Component({
  selector: "app-pagination",
  templateUrl: "/src/components/pagination/pagination-template.html",
})
export class PaginationComponent {
  private service = inject(AdminPanelService);
  pages = computed(() => this.service.pages(), this);
  page = computed(() => this.service.page(), this);
  isNextDisabled = computed(() => this.service.page() >= this.service.pages(), this);

  prev() {
    this.service.prevPage();
  }

  next() {
    this.service.nextPage();
  }
}
