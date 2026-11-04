import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const BACKEND_URL = BASE_URL.replace(/\/api$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach the current locale on every request so the backend can persist it
api.interceptors.request.use((config) => {
  if (typeof document !== "undefined") {
    const locale = document.documentElement.getAttribute("data-locale") ?? "en";
    config.headers["X-Locale"] = locale;
  }
  return config;
});

export const getCsrfCookie = () =>
  axios.get(`${BACKEND_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });

/** The message the API sent back for a failed request, or the fallback (typed replacement for `catch (e: any)`) */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

export default api;
