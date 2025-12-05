import { AdminPanelService } from "@/app/admin-service";
import { Component, inject } from "angular";

@Component({
  selector: "app-header",
  templateUrl: "/src/components/header/header-template.html",
})
export class HeaderComponent {
  private adminPanelService = inject(AdminPanelService);

  openModal() {
    this.adminPanelService.isOpenModal(true);
  }
}
