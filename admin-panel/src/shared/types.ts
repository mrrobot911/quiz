export interface IQuestionDTO {
  id: number;
  text: string;
  options: Array<string>;
  correct_answer: string;
}

export interface IPostBody {
  text: string;
  options: Array<string>;
  correct_answer: number;
}

export interface IQuestionsDTO {
  questions: Array<IQuestionDTO>;
  total_pages: number;
  total_count: number;
  page: number;
}

export interface IQuestion {
  id: number | null;
  text: string;
  options: Array<string>;
  answer: {
    id: number;
    text: string;
  };
}
