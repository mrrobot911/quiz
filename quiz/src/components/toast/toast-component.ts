import { Component, computed, inject } from "@angular";
import { ToastService } from "./toast-service";

@Component({
    selector: 'app-toast',
    templateUrl: '/src/components/toast/toast-template.html'
})
export class ToastComponent {
    private toastService = inject(ToastService);
    toasts = computed(() => this.toastService.toasts(), this);
}