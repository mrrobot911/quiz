package middleware

import (
	"net/http"
	"net/url"
	"strings"
)

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			parsedOrigin, err := url.Parse(origin)
			if err == nil {
				host := parsedOrigin.Hostname()
				port := parsedOrigin.Port()
				scheme := parsedOrigin.Scheme

				if (strings.EqualFold(scheme, "http") || strings.EqualFold(scheme, "https")) &&
					(strings.EqualFold(host, "localhost") || strings.EqualFold(host, "127.0.0.1")) &&
					port != "" {
					w.Header().Set("Access-Control-Allow-Origin", origin)
				}
			}
		}

		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			return
		}

		next.ServeHTTP(w, r)
	})
}
