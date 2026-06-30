import { isDevelopment } from "../constants";
import axios, { AxiosRequestConfig } from "axios";
import apiEndPoints from "../constants/apiEndPoints";

// setup base thing
const axiosInter = axios.create({
  baseURL: apiEndPoints.BASE_URL,
  responseType: "json",
  headers: { "Content-Type": "application/json" },
});

// type handling
interface IResponse<T> {
  data?: T | null;
  message: string;
  success: boolean;
  failed: boolean;
  statusCode: number;
  fullResponse?: any;
}

// caller function
async function caller<T>(
  type: "post" | "get" | "put" | "delete",
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any>
) {
  let response: IResponse<T>;

  try {
    let apiRes;
    if (type === "get" || type === "delete") {
      apiRes = await axiosInter[type](url, config);
    } else {
      apiRes = await axiosInter[type](url, data, config);
    }

    response = {
      data: apiRes.data,
      message: apiRes.data?.ResponseMessage || "",
      success: true,
      failed: false,
      statusCode: apiRes.status,
    };
  } catch (err: any) {
    const message =
      err.response?.data?.ResponseMessage ||
      err?.response?.data?.error ||
      err?.message ||
      "Something went wrong";

    response = {
      data: null,
      statusCode: err?.status || 500,
      success: false,
      failed: true,
      message: message,
      fullResponse: err?.response?.data,
    };
  }

  // These are logs for DevTools
  if (isDevelopment) {
    console.log("\n\n");
    console.log("Api Call --> ", `[${type?.toUpperCase()}]`, url);
    if (data) {
      console.log("\tdata ->", data);
    }
    if (config) {
      console.log("\tconfig ->", config);
    }
    console.log("\tresponse ->", response);
    console.log("\n");
  }

  return response as IResponse<T>;
}

const api = {
  async post<T>(url: string, data: any, config?: AxiosRequestConfig<any>) {
    return caller<T>("post", url, data, config);
  },

  async get<T>(url: string, config?: AxiosRequestConfig<any>) {
    return caller<T>("get", url, undefined, config);
  },

  async delete<T>(url: string, config?: AxiosRequestConfig<any>) {
    return caller<T>("delete", url, undefined, config);
  },

  async put<T>(url: string, data: any, config?: AxiosRequestConfig<any>) {
    return caller<T>("put", url, data, config);
  },
};

export default api;

export function getAuthHeader(jwt: any) {
  return {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  };
}
