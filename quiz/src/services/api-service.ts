import { inject, Injectable } from "@angular";
import { HttpService } from "./http-service.js";
import { ValidatorService } from "./validator-service.js";

Injectable()
export class ApiService {
    private http = inject(HttpService);

    getSession() {
        return this.http.get("/check-session")
            .then((resp: unknown) => {
                if (!ValidatorService.convertSessionStatsFromDTO(resp)) {
                    throw new Error("Invalid session data");
                }
                return resp;
            });
    }

    startQuiz() {
        return this.http.get("/start")
            .then((resp: unknown) => {
                if (!ValidatorService.convertStartResponseFromDTO(resp)) {
                    throw new Error("Invalid start response");
                }
                return resp;
            });
    }

    postAnswer(answerIdx: number, questionIdx: number, questionId: number) {
        return this.http.post("/answer", {
            answer: answerIdx,
            question_idx: questionIdx,
            question_id: questionId
        })
            .then((resp: unknown) => {
                if (!ValidatorService.convertAnswerResponseFromDTO(resp)) {
                    throw new Error("Invalid answer response");
                }
                return resp;
            });
    }
}