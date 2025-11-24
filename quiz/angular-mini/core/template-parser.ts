export interface BaseTemplateToken {
  type: 'text' | 'if' | 'for' | 'interpolation' | 'event' | 'element';
}

export interface TextToken extends BaseTemplateToken {
  type: 'text';
  content: string;
}

export interface InterpolationToken extends BaseTemplateToken {
  type: 'interpolation';
  content: string;
}

export interface EventToken extends BaseTemplateToken {
  type: 'event';
  content: string;
}

export interface IfToken extends BaseTemplateToken {
  type: 'if';
  condition: string;
  children: TemplateToken[];
  elseBlock?: TemplateToken[];
}

export interface ForToken extends BaseTemplateToken {
  type: 'for';
  itemName: string;
  listExpression: string;
  trackExpression?: string;
  children: TemplateToken[];
  emptyBlock?: TemplateToken[];
}

export interface ElementToken extends BaseTemplateToken {
  type: 'element';
  tagName: string;
  attributes: Array<{
    name: string;
    value: string;
    originalName: string;
  }>;
  children: TemplateToken[];
  isComponent: boolean;
}

export type TemplateToken = TextToken | InterpolationToken | EventToken | IfToken | ForToken | ElementToken;

export class TemplateParser {
  private pos = 0;
  private input: string;

  constructor(template: string) {
    this.input = template;
  }

  parse(): TemplateToken[] {
    const tokens: TemplateToken[] = [];

    while (this.pos < this.input.length) {
      const token = this.parseNextToken();
      if (token) tokens.push(token);
    }

    return tokens;
  }

  private parseNextToken(): TemplateToken | null {
    this.skipWhitespace();
    if (this.pos >= this.input.length) return null;

    if (this.input[this.pos] === '<') {
      if (this.input[this.pos + 1] === '/') {
        return null;
      }
      return this.parseElement();
    }

    if (this.input.startsWith('@if', this.pos)) {
      return this.parseIf();
    }
    if (this.input.startsWith('@for', this.pos)) {
      return this.parseFor();
    }
    if (this.input.startsWith('{{', this.pos)) {
      return this.parseInterpolation();
    }

    return this.parseText();
  }

  private parseElement(): ElementToken {
    this.pos++; // Skip '<'

    const tagName = this.readUntil(/[\s\/>]/);
    const isComponent = tagName.includes('-');

    const attributes: Array<{ name: string, value: string, originalName: string }> = [];

    while (this.pos < this.input.length && this.input[this.pos] !== '>' && this.input[this.pos] !== '/') {
      this.skipWhitespace();
      if (this.input[this.pos] === '>' || this.input[this.pos] === '/') break;

      const attr = this.parseAttribute();
      if (attr) {
        let processedName = attr.name;
        let processedValue = attr.value;

        if (attr.name.startsWith('[') && attr.name.endsWith(']')) {
          processedName = 'data-bind-' + attr.name.slice(1, -1);
        }
        else if (attr.name.startsWith('(') && attr.name.endsWith(')')) {
          processedName = 'data-event-' + attr.name.slice(1, -1);
        }
        else if (attr.name.startsWith('on-')) {
          processedName = 'data-event-' + attr.name.slice(3);
        }

        attributes.push({
          name: processedName,
          value: processedValue,
          originalName: attr.name,
        });
      }
    }

    const isSelfClosing = this.input[this.pos] === '/' || this.isSelfClosingTag(tagName);
    if (isSelfClosing) {
      if (this.input[this.pos] === '/') {
        this.pos++; // Skip '/'
      }
      this.pos++; // Skip '>'

      return {
        type: 'element',
        tagName,
        attributes,
        children: [],
        isComponent
      };
    }

    this.pos++; // Skip '>'

    const children: TemplateToken[] = [];
    while (this.pos < this.input.length && !this.input.startsWith(`</${tagName}>`, this.pos)) {
      const token = this.parseNextToken();
      if (token) {
        children.push(token);
      } else {
        if (this.input.startsWith(`</${tagName}>`, this.pos)) {
          break;
        }
        const textToken = this.parseText();
        if (textToken) children.push(textToken);
      }
    }

    if (this.input.startsWith(`</${tagName}>`, this.pos)) {
      this.pos += tagName.length + 3; // </${tagName}>
    }

    return {
      type: 'element',
      tagName,
      attributes,
      children,
      isComponent
    };
  }

  private parseAttribute(): { name: string, value: string } | null {
    const name = this.readUntil(/[=\s>\/]/);
    if (this.pos >= this.input.length) return { name, value: '' };

    if (this.input[this.pos] === '=') {
      this.pos++; // Skip '='
      const quote = this.input[this.pos];
      if (quote === '"' || quote === "'") {
        this.pos++; // Skip opening quote
        const value = this.readUntil(new RegExp(quote));
        this.pos++; // Skip closing quote
        return { name, value };
      } else {
        const value = this.readUntil(/[\s>\/]/);
        return { name, value };
      }
    }

    return { name, value: '' };
  }

  private isSelfClosingTag(tagName: string): boolean {
    const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
    return selfClosingTags.includes(tagName.toLowerCase());
  }

  private parseText(): TextToken {
    let content = '';

    while (this.pos < this.input.length) {
      if (this.input[this.pos] === '<' ||
        this.input.startsWith('{{', this.pos) ||
        this.input.startsWith('@if', this.pos) ||
        this.input.startsWith('@for', this.pos)) {
        break;
      }

      content += this.input[this.pos];
      this.pos++;
    }

    return { type: 'text', content };
  }

  private parseIf(): IfToken {
    this.pos += 3; // Skip '@if'
    this.skipWhitespace();

    if (this.input[this.pos] !== '(') {
      throw new Error(`Expected ( after @if at position ${this.pos}`);
    }
    this.pos++;

    const condition = this.readBalancedParentheses();
    this.skipWhitespace();

    let ifBlock: TemplateToken[] = [];
    let elseBlock: TemplateToken[] = [];

    if (this.input[this.pos] === '{') {
      ifBlock = this.parseBlock();
    } else {
      ifBlock = this.parseInlineContent();
    }

    this.skipWhitespace();

    if (this.input.startsWith('@else', this.pos)) {
      this.pos += 5; // Skip '@else'
      this.skipWhitespace();

      if (this.input.startsWith('@if', this.pos)) {
        elseBlock = [this.parseIf()];
      } else if (this.input[this.pos] === '{') {
        elseBlock = this.parseBlock();
      } else {
        elseBlock = this.parseInlineContent();
      }
    }

    return {
      type: 'if',
      condition: condition.trim(),
      children: ifBlock,
      elseBlock
    };
  }

  private parseFor(): ForToken {
    this.pos += 4; // Skip '@for'
    this.skipWhitespace();

    if (this.input[this.pos] !== '(') {
      throw new Error('Expected ( after @for');
    }
    this.pos++;

    const forContent = this.readUntilString(')');
    this.pos++; // Skip ')'
    this.skipWhitespace();

    const letMatch = forContent.match(/let\s+(\w+)\s+of\s+([^;]+)/);
    if (!letMatch) {
      throw new Error('Invalid @for syntax. Expected: let item of list');
    }

    const itemName = letMatch[1];
    const listExpression = letMatch[2].trim();

    let trackExpression = '';
    const trackMatch = forContent.match(/track\s+([^)]+)$/);
    if (trackMatch) {
      trackExpression = trackMatch[1].trim();
    }

    let forBlock: TemplateToken[] = [];
    if (this.input[this.pos] === '{') {
      forBlock = this.parseBlock();
    } else {
      forBlock = this.parseInlineContent();
    }

    let emptyBlock: TemplateToken[] = [];
    this.skipWhitespace();
    if (this.input.startsWith('@empty', this.pos)) {
      this.pos += 6; // Skip '@empty'
      this.skipWhitespace();

      if (this.input[this.pos] === '{') {
        emptyBlock = this.parseBlock();
      } else {
        emptyBlock = this.parseInlineContent();
      }
    }

    return {
      type: 'for',
      itemName,
      listExpression,
      trackExpression,
      children: forBlock,
      emptyBlock
    };
  }

  private parseInlineContent(): TemplateToken[] {
    const tokens: TemplateToken[] = [];
    let content = '';

    while (this.pos < this.input.length) {
      if (this.input.startsWith('@else', this.pos) ||
        this.input.startsWith('@if', this.pos) ||
        this.input.startsWith('@for', this.pos) ||
        this.input.startsWith('</', this.pos)) {
        break;
      }

      content += this.input[this.pos];
      this.pos++;
    }

    if (content.trim()) {
      const contentParser = new TemplateParser(content.trim());
      tokens.push(...contentParser.parse());
    }

    return tokens;
  }

  private parseBlock(): TemplateToken[] {
    if (this.input[this.pos] !== '{') {
      throw new Error('Expected {');
    }
    this.pos++; // Skip '{'

    const tokens: TemplateToken[] = [];
    let depth = 1;
    let content = '';

    while (this.pos < this.input.length && depth > 0) {
      if (this.input[this.pos] === '{') {
        depth++;
        content += this.input[this.pos];
        this.pos++;
      } else if (this.input[this.pos] === '}') {
        depth--;
        if (depth === 0) {
          this.pos++; // Skip closing '}'
          break;
        } else {
          content += this.input[this.pos];
          this.pos++;
        }
      } else {
        content += this.input[this.pos];
        this.pos++;
      }
    }

    if (content.trim()) {
      const blockParser = new TemplateParser(content);
      return blockParser.parse();
    }

    return tokens;
  }

  private parseInterpolation(): InterpolationToken {
    this.pos += 2; // Skip '{{'
    const content = this.readUntilString('}}');
    this.pos += 2; // Skip '}}'

    return {
      type: 'interpolation',
      content: content.trim()
    };
  }

  private readBalancedParentheses(): string {
    let result = '';
    let depth = 1;

    while (this.pos < this.input.length && depth > 0) {
      if (this.input[this.pos] === '(') {
        depth++;
      } else if (this.input[this.pos] === ')') {
        depth--;
        if (depth === 0) {
          this.pos++; // Skip closing ')'
          break;
        }
      }

      if (depth > 0) { // Don't include the outer parentheses
        result += this.input[this.pos];
      }
      this.pos++;
    }

    return result;
  }

  private readUntil(regex: RegExp): string {
    let result = '';
    while (this.pos < this.input.length && !regex.test(this.input[this.pos])) {
      result += this.input[this.pos];
      this.pos++;
    }
    return result;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  private readUntilString(stopChar: string): string {
    let result = '';
    while (this.pos < this.input.length && !this.input.startsWith(stopChar, this.pos)) {
      result += this.input[this.pos];
      this.pos++;
    }
    return result;
  }
}