type Listener = () => void;
const signalRegistry = new Set<Set<Listener>>();

export interface WritableSignal<T> extends Function {
  (): T;
  (v: T): void;
  set(v: T): void;
  update(updater: (v: T) => T): void;
  subscribe(l: Listener): () => void;
  __isSignal: true;
}

let effectStack: (() => void)[] = [];

export function signal<T>(initial: T): WritableSignal<T> {
  let value = initial;
  const subs = new Set<Listener>();
  signalRegistry.add(subs);

  const fn = ((v?: T): T => {
    if (v !== undefined) {
      if (value !== v) {
        value = v;
        subs.forEach(l => l());
      }
    } else {
      const currentEffect = effectStack[effectStack.length - 1];
      if (currentEffect) {
        subs.add(currentEffect);
      }
    }
    return value;
  }) as WritableSignal<T>;

  fn.set = (v: T) => fn(v);
  fn.update = (updater: (v: T) => T) => fn(updater(fn()));
  fn.subscribe = (l: Listener) => {
    subs.add(l);
    return () => subs.delete(l);
  };

  fn.__isSignal = true;

  return fn;
}

export function isSignal(value: any): value is WritableSignal<any> {
  return value && value.__isSignal === true;
}

export function effect(fn: () => void) {
  const effectFn = () => {
    if (effectStack.includes(effectFn)) return;

    effectStack.push(effectFn);
    try {
      fn();
    } finally {
      effectStack.pop();
    }
  };

  effectFn();

  return () => {
    removeEffectFromAllSignals(effectFn);
  };
}

export function computed<T>(computeFn: () => T, instance?: any): WritableSignal<T> {
  const result = signal<T>(computeFn());

  const unsubscribe = effect(() => {
    result.set(computeFn());
    if (instance && instance.__rerender && !instance.__destroyed) {
      queueMicrotask(() => {
        if (instance.__rerender && !instance.__destroyed) {
          instance.__rerender();
        }
      });
    }
  });

  if (instance && instance.__effectUnsubscribes) {
    instance.__effectUnsubscribes.push(unsubscribe);
  }

  return result;
}

function removeEffectFromAllSignals(effectFn: Listener) {
  signalRegistry.forEach(subs => {
    subs.delete(effectFn);
  });
}
