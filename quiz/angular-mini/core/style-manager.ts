export class StyleManager {
    private styleElements = new Map<string, HTMLStyleElement>();
    private componentStyles = new Map<string, string>();

    addComponentStyles(componentId: string, styles: string[]): void {
        if (styles.length === 0) return;

        const styleContent = styles.join('\n');
        this.componentStyles.set(componentId, styleContent);

        let styleElement = this.styleElements.get(componentId);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.setAttribute('data-component', componentId);
            document.head.appendChild(styleElement);
            this.styleElements.set(componentId, styleElement);
        }

        styleElement.textContent = styleContent;
    }

    removeComponentStyles(componentId: string): void {
        const styleElement = this.styleElements.get(componentId);
        if (styleElement) {
            document.head.removeChild(styleElement);
            this.styleElements.delete(componentId);
            this.componentStyles.delete(componentId);
        }
    }
}

export const styleManager = new StyleManager();