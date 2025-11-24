import type { IAnswer, IQuestion, IResponse, IStats } from "@/shared/types";
import { responseStatuses } from "../shared/constants";

export class ValidatorService {
    constructor() {
        throw new Error('ConvertorService is a static class');
    }

    static convertSessionStatsFromDTO(data: unknown) {
        return this.validStats(data)
    }

    static convertStartResponseFromDTO(data: unknown) {
        return this.validResponse(data)
    }

    static convertAnswerResponseFromDTO(data: unknown): data is IAnswer {
        return this.validResponse(data)
            && 'correct' in data
            && typeof data.correct === 'boolean'
            && 'reason' in data
            && typeof data.reason === 'string'
            && Object.keys(responseStatuses).includes(data.reason)
            && 'correct_answer_idx' in data
            && typeof data.correct_answer_idx === 'number'
    }

    private static validStats(data: unknown): data is IStats {
        return typeof data === 'object'
            && data !== null
            && 'total_correct' in data
            && typeof data.total_correct === 'number'
            && data.total_correct >= 0
            && 'total_incorrect' in data
            && typeof data.total_incorrect === 'number'
            && data.total_incorrect >= 0
            && 'has_active_game' in data
            && typeof data.has_active_game === 'boolean'
            && "current_index" in data
            && typeof data.current_index === 'number'
            && data.current_index >= 0
    }

    private static validResponse(data: unknown): data is IResponse {
        return typeof data === 'object'
            && data !== null
            && this.validStats(data)
            && (!('next_question' in data)
                || ('next_question' in data
                    && data.next_question !== null
                    && this.isValidQuestion(data.next_question)))
    }


    private static isValidQuestion(question: unknown): question is IQuestion {
        return typeof question === 'object'
            && question !== null
            && "id" in question
            && typeof question.id === 'number'
            && "text" in question
            && typeof question.text === 'string'
            && "options" in question
            && Array.isArray(question.options)
            && question.options.every(opt => typeof opt === 'string')
            && "time_limit" in question
            && typeof question.time_limit === 'number'
            && question.time_limit > 0;
    }
}