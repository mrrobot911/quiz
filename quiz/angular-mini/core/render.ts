import { effect, isSignal } from '../signals/signal';
import { TemplateParser, type ElementToken, type TemplateToken } from './template-parser';
import { ComponentRegistry } from './registry';
import { inject } from './di';
import { templateLoader } from './template-loader';
import { styleManager } from './style-manager';

export function renderTemplate(
    template: string,
    ctx: any,
    root: HTMLElement
): HTMLElement {
    const parser = new TemplateParser(template);
    const tokens = parser.parse();

    root.innerHTML = '';

    renderTokens(tokens, ctx, root);

    return root;
}

function renderTokens(tokens: TemplateToken[], ctx: any, parent: Element): void {
    for (const token of tokens) {
        switch (token.type) {
            case 'text':
                if (token.content.trim()) {
                    parent.insertAdjacentHTML('beforeend', token.content);
                }
                break;

            case 'interpolation':
                const value = evaluate(token.content, ctx);
                const textNode = document.createTextNode(String(value ?? ''));
                parent.appendChild(textNode);
                break;

            case 'if':
                const condition = evaluate(token.condition, ctx);

                if (condition) {
                    renderTokens(token.children, ctx, parent);
                } else if (token.elseBlock) {
                    renderTokens(token.elseBlock, ctx, parent);
                }
                break;

            case 'for':
                const list = evaluate(token.listExpression, ctx) || [];

                if (list.length === 0 && token.emptyBlock) {
                    renderTokens(token.emptyBlock, ctx, parent);
                } else {
                    list.forEach((item: any, index: number) => {
                        const localCtx = Object.create(ctx);
                        localCtx[token.itemName] = item;
                        localCtx.$index = index;
                        renderTokens(token.children, localCtx, parent);
                    });
                }
                break;

            case 'element':
                renderElement(token, ctx, parent);
                break;

            case 'event':
                console.warn('Unexpected event token during rendering');
                break;
        }
    }
}

function renderElement(token: ElementToken, ctx: any, parent: Element): void {
    const element = document.createElement(token.tagName);

    token.attributes.forEach(attr => {
        if (!isSpecialAttribute(attr.originalName)) {
            const value = evaluateAttribute(attr.value, ctx);
            element.setAttribute(attr.name, value);
        }
    });

    renderTokens(token.children, ctx, element);

    processElementAttributes(element, token, ctx);

    parent.appendChild(element);
}

function isSpecialAttribute(attrName: string): boolean {
    return attrName.startsWith('[') ||
        attrName.startsWith('(') ||
        attrName.startsWith('on-') ||
        attrName === 'data-component' ||
        attrName.startsWith('data-bind-') ||
        attrName.startsWith('data-event-') ||
        attrName.startsWith('data-input-') ||
        attrName.startsWith('data-output-');
}

function processElementAttributes(element: Element, token: ElementToken, ctx: any): void {
    token.attributes
        .filter(attr => attr.name.startsWith('data-bind-'))
        .forEach(attr => {
            const propName = attr.name.slice(10); // data-bind-title -> title
            const unsubscribe = effect(() => {
                const value = evaluate(attr.value, ctx);
                (element as any)[propName] = value;
            });
            if (ctx.__effectUnsubscribes) {
                ctx.__effectUnsubscribes.push(unsubscribe);
            }
        });

    token.attributes
        .filter(attr => attr.name.startsWith('data-event-'))
        .forEach(attr => {
            const eventName = attr.name.slice(11); // data-event-click -> click
            element.addEventListener(eventName, (event) => {
                if (eventName === 'click') {
                    event.preventDefault();
                }
                evaluateEvent(attr.value, ctx, event);
                ctx.__rerender?.();
            });
        });

    if (token.isComponent) {
        processComponentElement(element, token, ctx);
    }
}

function processComponentElement(element: Element, token: ElementToken, ctx: any): void {
    const selector = token.tagName;
    const Cls = ComponentRegistry.get(selector);

    if (Cls) {
        const childInstance = inject(Cls);
        childInstance.root = element as HTMLElement;
        childInstance.__componentId = `${selector}-${crypto.randomUUID()}`;
        childInstance.__destroyed = false;
        childInstance.__effectUnsubscribes = [];

        childInstance.__rerender = () => {
            if (childInstance.__destroyed) return;
            if (childInstance.__effectUnsubscribes) {
                childInstance.__effectUnsubscribes.forEach(unsub => unsub());
                childInstance.__effectUnsubscribes = [];
            }
            renderTemplate(childInstance.__templateString, childInstance, element as HTMLElement);
        };

        token.attributes
            .filter(attr => attr.name.startsWith('data-bind-'))
            .forEach(attr => {
                const inputName = attr.name.slice(11); // data-bind-title -> title
                const unsubscribe = effect(() => {
                    const value = evaluate(attr.value, ctx);
                    if (childInstance[inputName] && typeof childInstance[inputName] === 'function') {
                        childInstance[inputName].set(value);
                    } else {
                        childInstance[inputName] = value;
                    }
                    setTimeout(() => childInstance.__rerender?.(), 0);
                });
                if (ctx.__effectUnsubscribes) {
                    ctx.__effectUnsubscribes.push(unsubscribe);
                }
            });

        token.attributes
            .filter(attr => attr.name.startsWith('data-event-'))
            .forEach(attr => {
                const outputName = attr.name.slice(11);

                const output = childInstance[outputName];

                if (output && typeof output.subscribe === 'function') {
                    output.subscribe((eventValue: any) => {
                        const parentMethod = evaluate(attr.value, ctx);
                        if (typeof parentMethod === 'function') {
                            parentMethod.call(ctx, eventValue);
                            ctx.__rerender?.();
                        }
                    });
                } else {
                    console.warn(`>>> FAILED: Output '${outputName}' not found or invalid`);
                }
            });

        templateLoader.loadComponentTemplate(childInstance).then(({ template, styles }) => {
            childInstance.__templateString = template;
            styleManager.addComponentStyles(childInstance.__componentId, styles);
            renderTemplate(template, childInstance, element as HTMLElement);

            if (typeof childInstance.onInit === 'function') {
                childInstance.onInit();
            }

            (element as any).__ngInstance = childInstance;
            setTimeout(() => childInstance.__rerender?.(), 0);
        });
    }
}

function evaluate(expr: string, ctx: any): any {
    try {
        const funcWithArgsMatch = expr.match(/^(\w+)\((.*)\)$/);
        if (funcWithArgsMatch) {
            const funcName = funcWithArgsMatch[1];
            const argsStr = funcWithArgsMatch[2];

            if (typeof ctx[funcName] === 'function') {
                const args = parseArguments(argsStr, ctx);
                return ctx[funcName].apply(ctx, args);
            }
        }

        if (expr.includes('===') || expr.includes('!==') ||
            expr.includes('==') || expr.includes('!=') ||
            expr.includes('>') || expr.includes('<') ||
            expr.includes('>=') || expr.includes('<=') ||
            expr.includes('&&') || expr.includes('||') ||
            expr.includes('!')) {

            return evaluateExpression(expr, ctx);
        }

        const bracketMatch = expr.match(/^(\w+)\[(\w+)\]$/);
        if (bracketMatch) {
            const objName = bracketMatch[1];
            const keyName = bracketMatch[2];

            const obj = ctx[objName];
            const key = ctx[keyName];

            if (obj && key !== undefined) {
                const value = (isSignal(obj)) ? obj()[key] : obj[key]

                if (isSignal(value)) return value();
                return value;
            }
        }

        if (expr.endsWith('()')) {
            const funcName = expr.slice(0, -2);
            const func = ctx[funcName];
            if (typeof func === 'function') {
                if (isSignal(func)) {
                    return func();
                }
                const result = func.call(ctx);
                return result;
            }
        }

        if (expr in ctx) {
            const value = ctx[expr];
            if (isSignal(value)) {
                return value();
            }
            return value;
        }

        const parts = expr.split('.');
        let result: any = ctx;
        for (const part of parts) {
            if (result == null) break;
            result = result[part];
        }

        if (typeof result === 'function') {
            return result.bind(ctx);
        }

        return result;
    } catch (error) {
        console.error('Evaluation error:', error, 'for expression:', expr);
        return undefined;
    }
}

function evaluateEvent(expr: string, ctx: any, event: Event): any {
    try {
        const funcWithArgsMatch = expr.match(/^(\w+)\((.*)\)$/);
        if (funcWithArgsMatch) {
            const funcName = funcWithArgsMatch[1];
            const argsStr = funcWithArgsMatch[2];

            if (typeof ctx[funcName] === 'function') {
                const args = parseArguments(argsStr, ctx, event);
                const result = ctx[funcName].apply(ctx, args);
                return result;
            }

            const proto = Object.getPrototypeOf(ctx);
            if (proto && typeof proto[funcName] === 'function') {
                const args = parseArguments(argsStr, ctx, event);
                const result = proto[funcName].apply(ctx, args);
                return result;
            }
        }

        const func = ctx[expr];
        if (typeof func === 'function') {
            return func.call(ctx, event);
        }

        return evaluate(expr, ctx);

    } catch (error) {
        console.error('Event evaluation error:', error, 'for expression:', expr);
        return undefined;
    }
}

function evaluateAttribute(expr: string, ctx: any): string {
    if (expr.includes('{{')) {
        return expr.replace(/\{\{(.*?)\}\}/g, (_, content) => {
            const value = evaluate(content.trim(), ctx);
            return String(value ?? '');
        });
    }
    return expr;
}

function parseArguments(argsStr: string, ctx: any, event?: Event): any[] {
    if (!argsStr.trim()) {
        return event ? [event] : [];
    }
    return argsStr.split(',').map(arg => {
        arg = arg.trim();

        if (arg === '$event') {
            return event;
        }

        if (arg === '$index') {
            return ctx.$index;
        }

        if (/^-?\d+$/.test(arg)) {
            return parseInt(arg, 10);
        }
        if (/^-?\d*\.\d+$/.test(arg)) {
            return parseFloat(arg);
        }

        if ((arg.startsWith('"') && arg.endsWith('"')) ||
            (arg.startsWith("'") && arg.endsWith("'"))) {
            const strValue = arg.slice(1, -1);
            return strValue;
        }

        if (arg === 'true') {
            return true;
        }
        if (arg === 'false') {
            return false;
        }

        if (arg in ctx) {
            const value = ctx[arg];

            if (isSignal(value)) {
                const signalValue = value();
                return signalValue;
            }
            return value;
        }

        const parts = arg.split('.');
        let result: any = ctx;
        for (const part of parts) {
            if (result == null) break;
            result = result[part];
        }

        if (result !== ctx) {
            return result;
        }
        return arg;
    });
}

function evaluateExpression(expr: string, ctx: any): any {
    let processedExpr = expr.replace(/(\w+)\(\)/g, (match, funcName) => {
        const func = ctx[funcName];
        if (typeof func === 'function') {
            const value = isSignal(func) ? func() : func.call(ctx);
            return JSON.stringify(value);
        }
        return match;
    });

    const ternaryMatch = processedExpr.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
    if (ternaryMatch) {
        const condition = ternaryMatch[1].trim();
        const thenPart = ternaryMatch[2].trim();
        const elsePart = ternaryMatch[3].trim();

        const conditionResult = evaluateSimpleExpression(condition, ctx);

        return conditionResult ? thenPart : elsePart;
    }
    return evaluateSimpleExpression(processedExpr, ctx);
}

function evaluateSimpleExpression(expr: string, ctx: any): any {
    let processedExpr = expr;

    const knownVars = Object.keys(ctx).filter(key =>
        !key.startsWith('__') &&
        typeof ctx[key] !== 'function'
    );

    const varRegex = new RegExp(`\\b(${knownVars.join('|')})\\b`, 'g');

    processedExpr = processedExpr.replace(varRegex, (match) => {
        const value = ctx[match];
        return JSON.stringify(value);
    });

    processedExpr = processedExpr.replace(/(\$\w+)/g, (match) => {
        if (match in ctx) {
            const value = ctx[match];
            return JSON.stringify(value);
        }
        return match;
    });

    try {
        const result = Function(`return ${processedExpr}`)();
        return result;
    } catch (error) {
        console.error('Simple expression error:', error, 'for:', expr, 'processed:', processedExpr);
        return undefined;
    }
}
