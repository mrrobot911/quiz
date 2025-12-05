export interface ComponentMetadata {
  selector: string;
  template?: string;
  templateUrl?: string;
  styles?: string[];
  styleUrls?: string[];
}

export interface ComponentClass<T = any> {
  new(...args: any[]): T;
  __ngMetadata: ComponentMetadata;
}

export interface ComponentInstance {
  root: HTMLElement;
}

export interface OnInit {
  onInit(): void;
}

export interface OnDestroy {
  onDestroy(): void;
}
