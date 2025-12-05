import type { ComponentBase } from "angular-mini/core/base-component";

export type ComponentConstructor = new (...args: any[]) => ComponentBase;

export class ComponentRegistry {
  private static map = new Map<string, ComponentConstructor>();

  static register(Cls: ComponentConstructor) {
    const meta = (Cls as any).__ngMetadata;
    if (!meta?.selector) {
      throw new Error("Component must have selector in metadata");
    }
    this.map.set(meta.selector, Cls);
  }

  static get(selector: string): ComponentConstructor | undefined {
    return this.map.get(selector);
  }
}
