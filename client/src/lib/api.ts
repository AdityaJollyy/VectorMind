import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send/receive the auth cookie
});

/** Normalize any API failure into an Error with a user-friendly message. */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ??
      (error.code === "ERR_NETWORK"
        ? "Cannot reach the server. Is it running?"
        : "Something went wrong. Please try again.");
    return Promise.reject(new Error(message));
  }
);
