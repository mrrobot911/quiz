import { Component, computed, inject } from "angular";
import { AdminPanelService } from "./admin-service";

@Component({
  selector: "app-admin",
  templateUrl: "/src/app/admin-template.html",
})
export class AdminPanelComponent {
  private adminPanelService = inject(AdminPanelService);
  isModalOpen = computed(() => this.adminPanelService.isOpenModal(), this);
}
