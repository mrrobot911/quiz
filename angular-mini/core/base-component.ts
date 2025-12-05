export class ComponentBase {
    root!: HTMLElement;
    __componentId!: string;
    __destroyed = false;
    __rerender!: () => void;
    __inputUnsubscribes: Array<() => void> = [];
    __effectUnsubscribes: Array<() => void> = [];
    __templateString!: string;

    [key: string]: any;

    onInit?(): void;
    onDestroy?(): void;
}