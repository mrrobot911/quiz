import type { IQuestionDTO, IQuestionsDTO } from "@/shared/types";

export class ValidatorService {
  constructor() {
    throw new Error("ConvertorService is a static class");
  }

  static isValidQuestionDTO(data: unknown): data is IQuestionDTO {
    return this.isValidQuestion(data);
  }

  static isValidQuestionsDTO(data: unknown): data is IQuestionsDTO {
    return (
      typeof data === "object" &&
      data !== null &&
      "total_pages" in data &&
      typeof data.total_pages === "number" &&
      "total_count" in data &&
      typeof data.total_count === "number" &&
      "page" in data &&
      typeof data.page === "number" &&
      "questions" in data &&
      Array.isArray(data.questions) &&
      data.questions.every((question) => this.isValidQuestion(question))
    );
  }

  private static isValidQuestion(question: unknown): question is IQuestionDTO {
    return (
      typeof question === "object" &&
      question !== null &&
      "id" in question &&
      typeof question.id === "number" &&
      "text" in question &&
      typeof question.text === "string" &&
      "options" in question &&
      Array.isArray(question.options) &&
      question.options.every((opt) => typeof opt === "string") &&
      "correct_answer" in question &&
      typeof question.correct_answer === "number"
    );
  }
}
