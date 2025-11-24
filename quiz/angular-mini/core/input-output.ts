import { effect, signal } from "../signals/signal";

type Signal<T> = ReturnType<typeof signal<T>>;

// export function Input<T = any>() {
//     return function (target: any, propertyKey: string) {
//         const signalKey = `__input_signal_${propertyKey}`;

//         Object.defineProperty(target, propertyKey, {
//             get(this: any): T {
//                 if (!this[signalKey]) {
//                     this[signalKey] = signal<T>(undefined as T);
//                 }
//                 return this[signalKey]();
//             },
//             set(this: any, value: T | Signal<T>) {
//                 if (!this[signalKey]) {
//                     this[signalKey] = signal<T>(undefined as T);
//                 }

//                 if (value && typeof value === "function" && "subscribe" in value) {
//                     const external = value as Signal<T>;
//                     const unsub = external.subscribe(v => this[signalKey].set(v));
//                     this[signalKey].set(external());
//                     this.__inputUnsubscribes.push(unsub);
//                 } else {
//                     this[signalKey].set(value as T);
//                 }

//                 effect(() => {
//                     this[signalKey]();
//                     this.__rerender?.();
//                 });
//             }
//         });
//     };
// }

export function Output<T = any>() {
    return function (target: any, propertyKey: string) {
        const key = `__output_${propertyKey}`;
        Object.defineProperty(target, propertyKey, {
            get(this: any) {
                if (!this[key]) {
                    const listeners = new Set<(v: T) => void>();
                    this[key] = {
                        emit: (v: T) => listeners.forEach(l => l(v)),
                        subscribe: (l: (v: T) => void) => {
                            listeners.add(l);
                            return () => listeners.delete(l);
                        }
                    };
                }
                return this[key];
            }
        });
    };
}