package response

import (
	"encoding/json"
	"net/http"
)

func JsonResp[T any](w http.ResponseWriter, data T, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func OK[T any](w http.ResponseWriter, data T) {
	JsonResp(w, data, http.StatusOK)
}

func Created[T any](w http.ResponseWriter, data T) {
	JsonResp(w, data, http.StatusCreated)
}

func BadRequest(w http.ResponseWriter, msg string) {
	JsonResp(w, map[string]string{"error": msg}, http.StatusBadRequest)
}

func Unauthorized(w http.ResponseWriter, msg string) {
	JsonResp(w, map[string]string{"error": msg}, http.StatusUnauthorized)
}

func InternalError(w http.ResponseWriter, msg string) {
	JsonResp(w, map[string]string{"error": msg}, http.StatusInternalServerError)
}
