import { inject, Injectable } from "angular";
import { HttpService } from "./http-service";
import { ValidatorService } from "./validator-service";
import type { IPostBody } from "@/shared/types";
import { BASE_URL, PAGE_LIMIT, PAGE_NUMBER } from "@/shared/constants";

Injectable();
export class ApiService {
  private http = inject(HttpService);

  getAllQuestions(page: number = PAGE_NUMBER, limit: number = PAGE_LIMIT) {
    const url = new URL(BASE_URL);
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("page", page.toString());

    return this.http.get(url.toString()).then((resp: unknown) => {
      if (!ValidatorService.isValidQuestionsDTO(resp)) {
        throw new Error("Invalid start response");
      }
      return resp;
    });
  }

  getQuestion(questionId: number) {
    return this.http.get(`${BASE_URL}/${questionId}`).then((resp: unknown) => {
      if (!ValidatorService.isValidQuestionDTO(resp)) {
        throw new Error("Invalid answer response");
      }
      return resp;
    });
  }

  createQuestion(question: IPostBody) {
    return this.http
      .post(BASE_URL, {
        ...question,
      })
      .then((resp: unknown) => {
        if (!ValidatorService.isValidQuestionDTO(resp)) {
          throw new Error("Invalid answer response");
        }
        return resp;
      });
  }

  updateQuestion(questionId: number, question: IPostBody) {
    return this.http
      .put(`${BASE_URL}/${questionId}`, {
        ...question,
      })
      .then((resp: unknown) => {
        if (!ValidatorService.isValidQuestionDTO(resp)) {
          throw new Error("Invalid answer response");
        }
        return resp;
      });
  }

  deleteQuestion(questionId: number) {
    return this.http.delete(`${BASE_URL}/${questionId}`).then((resp: unknown) => {
      if (!ValidatorService.isValidQuestionDTO(resp)) {
        throw new Error("Invalid answer response");
      }
      return resp;
    });
  }
}
