import { Component, computed, inject } from "@angular";
import { StatisticService } from "./statistic-service";
import { STATS } from "@/shared/constants";

@Component({
    selector: 'app-stat',
    templateUrl: '/src/components/statistic/statistic-template.html'
})
export class StatisticComponent {
    statService = inject(StatisticService);
    state = computed(() => this.statService.stat(), this);
    keys = Object.keys(STATS);
    statisticText = STATS;
}