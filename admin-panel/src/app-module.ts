import { NgModule } from "angular";
import { AdminPanelComponent } from "./app/admin-component";
import { HeaderComponent } from "./components/header/header-component";
import { PaginationComponent } from "./components/pagination/pagination-component";
import { Modal } from "./components/modal/modal-component";
import { QuestionsListComponent } from "./components/questions-list/questions-list-component";

@NgModule({
  declarations: [HeaderComponent, PaginationComponent, Modal, QuestionsListComponent],
  bootstrap: [AdminPanelComponent],
})
export class AppModule {}
