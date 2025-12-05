export const BASE_URL = "http://localhost:5000/api/v1/questions";

export const PAGE_LIMIT = 10;

export const PAGE_NUMBER = 1;

export const DEFAULT_QUESTION = {
  id: null,
  text: "",
  options: ["", "", "", ""],
  answer: {
    id: 0,
    text: "",
  },
};
