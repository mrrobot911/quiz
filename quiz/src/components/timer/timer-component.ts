import { Component, computed, inject } from "@angular";
import { FormatTime } from "../../pipes/timer-pipe";
import { TimerService } from "./timer-service";

@Component({
    selector: 'app-timer',
    templateUrl: '/src/components/timer/timer-template.html'
})
export class TimerComponent {
    timerService = inject(TimerService);
    private timeFormat = FormatTime;
    time = computed(() => this.timeFormat.transform(this.timerService.time()), this);
    timeStyle = computed(() => this.timerService.time() <= 5 ? "timer__value--accent" : "timer__value", this);
}