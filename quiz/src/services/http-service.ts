import { Injectable } from "angular";
import { BASE_URL } from "../shared/constants";
import type { IPostBody } from "@/shared/types";

Injectable();
export class HttpService {
  get(url: string) {
    return fetch(`${BASE_URL}${url}`, {
      credentials: "include",
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

  post(url: string, body: IPostBody) {
    return fetch(`${BASE_URL}${url}`, {
      method: "POST",
      credentials: "include",
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
}
