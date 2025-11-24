import { ComponentRegistry } from "./registry";

export function Component(meta: any) {
  return (ctor: any) => {
    ctor.__ngMetadata = meta;
    ComponentRegistry.register(ctor);
  };
}

export function Injectable(dependencies?: any[]) {
  return (ctor: any) => {
    ctor.__ngInjectable = true;
    if (dependencies) {
      ctor.__ngDependencies = dependencies;
    }
  };
}

export function NgModule(metadata: {
  declarations?: any[];
  imports?: any[];
  bootstrap?: any[];
}) {
  return (moduleClass: any) => {
    const moduleInstance = {
      getBootstrapComponents: () => metadata.bootstrap || [],
      getDeclarations: () => metadata.declarations || [],
      getImports: () => metadata.imports || []
    };

    metadata.declarations?.forEach(component => {
      ComponentRegistry.register(component);
    });

    metadata.imports?.forEach(importedModule => {
      if (typeof importedModule === 'function' && importedModule.__ngModuleInstance) {
      }
    });

    moduleClass.__ngModuleInstance = moduleInstance;
    return moduleClass;
  };
}
