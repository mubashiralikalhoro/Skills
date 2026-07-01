import { env } from ".";
const version = env.VITE_API_VERSION;

const apiEndPoints = {
  BASE_URL: env.VITE_API_URL,
};

export default apiEndPoints;
