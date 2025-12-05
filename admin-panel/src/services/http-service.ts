import { Injectable } from "angular";
import type { IPostBody } from "@/shared/types";

Injectable();
export class HttpService {
  get(url: string) {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("HTTP GET Error:", error);
        throw error;
      });
  }

  post(url: string, body: IPostBody) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("HTTP POST Error:", error);
        throw error;
      });
  }

  put(url: string, body: IPostBody) {
    return fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("HTTP POST Error:", error);
        throw error;
      });
  }

  delete(url: string) {
    return fetch(url, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("HTTP GET Error:", error);
        throw error;
      });
  }
}
