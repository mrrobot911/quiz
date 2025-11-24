import { Injectable, signal } from "@angular";

@Injectable()
export class TimerService {
    time = signal(0);
    isActive = signal(false);
    private intervalId = signal<number | null>(null);

    start(initialValue: number) {
        if (this.isActive()) return;

        this.time.set(initialValue);
        this.isActive.set(true);

        this.intervalId.set(setInterval(() => {
            let value = this.time();
            value--;
            this.time.set(value);

            if (value <= 0) {
                this.complete();
            }
        }, 1000));
    }

    stop() {
        this.clearInterval();
    }

    private complete() {
        this.clearInterval();
        this.time.set(0);
    }

    private clearInterval() {
        this.isActive.set(false);
        const id = this.intervalId()
        if (id) {
            clearInterval(id);
            this.intervalId.set(null);
        }
    }
}