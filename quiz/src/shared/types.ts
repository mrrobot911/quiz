export interface IPostBody {
  answer: number;
  question_idx: number;
  question_id: number;
}

export type messageStatus = "timeout" | "wrong_answer" | "correct";

export interface IAnswer extends IResponse {
  correct: boolean;
  reason: messageStatus;
  correct_answer_idx: number;
}

export interface IQuestion {
  id: number;
  text: string;
  options: Array<string>;
  time_limit: number;
}

export interface IStats {
  total_correct: number;
  total_incorrect: number;
  has_active_game: boolean;
  current_index: number;
}

export interface IResponse extends IStats {
  next_question?: IQuestion;
}
