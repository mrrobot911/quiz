export const BASE_URL = "http://localhost:5000/api/v1/quiz";

export const TIMEOUT_DELAY = 2000;

export const MAX_MESSAGES = 3;

export const NEGATIVE_ANSWER = -1;

export const optionStatus = {
    correct: "correct",
    incorrect: "incorrect",
    checked: "checked",
}

export const messageStatus = {
    error: "error",
    success: "success",
    info: "info",
}

export const responseStatuses = {
    timeout: 'Time is up!',
    wrong_answer: 'Wrong answer',
    correct: 'Correct!'
};

export const STATS = {
    correctAnswers: "Correct answers",
    incorrectAnswers: "Incorrect answers",
    currentQuestionNumber: "Total answers",
}
