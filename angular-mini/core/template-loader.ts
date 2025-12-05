export interface TemplateConfig {
    templateUrl?: string;
    template?: string;
    styles?: string[];
    styleUrls?: string[];
}

class TemplateLoader {
    private templateCache = new Map<string, string>();
    private styleCache = new Map<string, string>();

    async loadComponentTemplate(component: any): Promise<{ template: string; styles: string[] }> {
        const config: TemplateConfig = component.constructor.__ngMetadata || {};

        let template = '';
        const styles: string[] = [];

        if (config.template) {
            template = config.template;
        } else if (config.templateUrl) {
            template = await this.loadTemplate(config.templateUrl);
        }

        if (config.styles) {
            styles.push(...config.styles);
        }

        if (config.styleUrls) {
            for (const styleUrl of config.styleUrls) {
                const styleContent = await this.loadStyle(styleUrl);
                styles.push(styleContent);
            }
        }

        return { template, styles };
    }

    private async loadTemplate(url: string): Promise<string> {
        if (this.templateCache.has(url)) {
            return this.templateCache.get(url)!;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load template from ${url}: ${response.status}`);
            }
            const template = await response.text();
            this.templateCache.set(url, template);
            return template;
        } catch (error) {
            console.error(`Template loading error for ${url}:`, error);
            throw error;
        }
    }

    private async loadStyle(url: string): Promise<string> {
        if (this.styleCache.has(url)) {
            return this.styleCache.get(url)!;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load style from ${url}: ${response.status}`);
            }
            const style = await response.text();
            this.styleCache.set(url, style);
            return style;
        } catch (error) {
            console.error(`Style loading error for ${url}:`, error);
            throw error;
        }
    }
}

export const templateLoader = new TemplateLoader();