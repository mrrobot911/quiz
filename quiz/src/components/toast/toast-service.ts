import { Injectable, signal } from "angular";
import {
  MAX_MESSAGES,
  messageStatus,
  responseStatuses,
  TIMEOUT_DELAY,
} from "../../shared/constants.js";

interface IToast {
  id: string;
  message: string;
  type: string;
}

Injectable();
export class ToastService {
  private timeouts = new Map();
  toasts = signal<IToast[]>([]);

  show(
    message: keyof typeof responseStatuses,
    type = messageStatus.info,
    duration = TIMEOUT_DELAY,
  ) {
    const newType = message === "correct" ? messageStatus.success : type;
    const newMessage = responseStatuses[message];
    this.create(newMessage, newType, duration);
  }

  success(msg: string, dur?: number) {
    this.create(msg, messageStatus.success, dur);
  }
  error(msg: string, dur?: number) {
    this.create(msg, messageStatus.error, dur);
  }
  info(msg: string, dur?: number) {
    this.create(msg, messageStatus.info, dur);
  }

  private create(message: string, type = messageStatus.info, duration = TIMEOUT_DELAY) {
    const id = crypto.randomUUID();
    const toast = { id, message, type };

    const newToasts = [...this.toasts(), toast].slice(-MAX_MESSAGES);
    this.toasts.set(newToasts);

    const timeout = setTimeout(() => {
      this.remove(id);
    }, duration);

    this.timeouts.set(id, timeout);
  }

  private remove(id: string) {
    clearTimeout(this.timeouts.get(id));
    this.timeouts.delete(id);

    const newToasts = this.toasts().filter((t) => t.id !== id);
    this.toasts.set(newToasts);
  }
}
