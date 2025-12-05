import { inject } from "./di";
import { ComponentRegistry } from "./registry";
import { renderTemplate } from "./render";
import { styleManager } from "./style-manager";
import { templateLoader } from "./template-loader";

export async function bootstrapModule(ModuleClass: any) {
  const moduleInstance = ModuleClass.__ngModuleInstance;

  if (!(moduleInstance)) {
    throw new Error('Bootstrap target must be an NgModule');
  }
  const bootstrapComponents = moduleInstance.getBootstrapComponents();

  if (bootstrapComponents.length === 0) {
    throw new Error('No bootstrap components specified in module');
  }
  for (const ComponentClass of bootstrapComponents) {
    await bootstrapRootComponent(ComponentClass);
  }
}

async function bootstrapRootComponent(ComponentClass: any) {
  const metadata = ComponentClass.__ngMetadata;
  if (!metadata?.selector) {
    throw new Error(`Bootstrap component must have a selector: ${ComponentClass.name}`);
  }
  const rootElement = document.querySelector(metadata.selector) as HTMLElement;

  if (!rootElement) {
    throw new Error(`Root element not found for selector: ${metadata.selector}`);
  }
  await bootstrapComponent(rootElement);
}

async function bootstrapComponent(rootEl: HTMLElement) {
  const selector = rootEl.tagName.toLowerCase();
  const Cls = ComponentRegistry.get(selector);

  if (!Cls) {
    console.warn(`No component found for selector: ${selector}`);
    return;
  }

  const instance = inject(Cls) as InstanceType<typeof Cls>;
  instance.root = rootEl;
  instance.__componentId = `${selector}-${crypto.randomUUID()}`;
  instance.__destroyed = false;
  instance.__inputUnsubscribes = [];
  instance.__effectUnsubscribes = [];

  try {
    const { template, styles } = await templateLoader.loadComponentTemplate(instance);
    instance.__templateString = template;

    styleManager.addComponentStyles(instance.__componentId, styles);

    renderTemplate(template, instance, rootEl);

    (rootEl as any).__ngInstance = instance;

    instance.__rerender = () => {
      if (instance.__destroyed) return;
      renderTemplate(template, instance, rootEl);
    };

    if (typeof instance.onInit === "function") {
      setTimeout(() => {
        if (!instance.__destroyed) instance.onInit?.();
      }, 0);
    }

    const destroyInstance = () => {
      if (instance.__destroyed) return;
      instance.__destroyed = true;

      instance.__inputUnsubscribes.forEach(unsub => unsub());
      instance.__inputUnsubscribes = [];

      if (instance.__effectUnsubscribes) {
        instance.__effectUnsubscribes.forEach(unsub => unsub());
        instance.__effectUnsubscribes = [];
      }

      if (typeof instance.onDestroy === "function") {
        try { instance.onDestroy(); } catch (e) { console.error(e); }
      }

      styleManager.removeComponentStyles(instance.__componentId);
    };

    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.removedNodes) {
          if (node === rootEl || node.contains?.(rootEl)) {
            destroyInstance();
            observer.disconnect();
            return;
          }
        }
      }
    });

    observer.observe(rootEl.parentNode || document.body, {
      childList: true,
      subtree: true
    });

    const originalRemove = rootEl.remove;
    rootEl.remove = function () {
      destroyInstance();
      observer.disconnect();
      return originalRemove.call(this);
    };

  } catch (error) {
    console.error(`Failed to bootstrap ${selector}:`, error);
  }
}
