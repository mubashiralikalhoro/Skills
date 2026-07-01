import { convertToOptions } from "../utils";

export const CODE_VERSION = "0.0.1";

export const APP_NAME = import.meta.env.VITE_APP_NAME || "Admin Panel";

export const env = {
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
  VITE_FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_API_VERSION: import.meta.env.VITE_API_VERSION,
};

export const isDevelopment = env.VITE_NODE_ENV === "development";
