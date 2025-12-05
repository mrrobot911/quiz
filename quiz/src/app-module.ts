import { QuizComponent } from "./app/quiz-component";
import { HeaderComponent } from "./components/header/header-component";
import { StartComponent } from "./components/start/start-component";
import { ToastComponent } from "./components/toast/toast-component";
import { QuestionComponent } from "./components/question/question-component";
import { TimerComponent } from "./components/timer/timer-component";
import { StatisticComponent } from "./components/statistic/statistic-component";
import { NgModule } from "angular";

@NgModule({
  declarations: [
    HeaderComponent,
    StartComponent,
    ToastComponent,
    QuestionComponent,
    TimerComponent,
    StatisticComponent,
  ],
  bootstrap: [QuizComponent],
})
export class AppModule {}
