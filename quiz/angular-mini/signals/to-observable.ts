import type { WritableSignal } from './signal';

export interface Observable<T> {
  subscribe: (cb: (v: T) => void) => { unsubscribe: () => void };
  value: T;
}

export function toObservable<T>(sig: WritableSignal<T>): Observable<T> {
  const obs: any = {
    value: sig(),
    subscribe: (cb: (v: T) => void) => {
      cb(obs.value);
      const unsub = sig.subscribe(v => {
        obs.value = v;
        cb(v);
      });
      return { unsubscribe: unsub };
    }
  };
  return obs;
}
