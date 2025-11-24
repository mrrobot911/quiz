export const INJECTOR = new Map<any, any>();

interface InjectableConstructor<T> {
  new (...args: any[]): T;
  __ngInjectable?: boolean;
  __ngDependencies?: any[];
}

export function inject<T>(Token: InjectableConstructor<T>): T {
  if (INJECTOR.has(Token)) {
    const instance = INJECTOR.get(Token);
    if (instance !== null) return instance;
  }

  const paramTypes: any[] = Token.__ngDependencies || [];
  const args = paramTypes.map((dep: any) => inject(dep));

  const instance = new Token(...args);
  INJECTOR.set(Token, instance);
  return instance;
}
