import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { isDevelopment } from "../constants";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getQueryFromObject = (obj: any) => {
  const queries: string[] = [];
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== null) {
      queries.push(`${key}=${obj[key]}`);
    }
  });
  return queries.join("&");
};

export const getDuration = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationInMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  return durationInMinutes;
};

export const formatTime = (timeStr: string | null) => {
  if (!timeStr) return "";
  const time = new Date(timeStr.endsWith("Z") ? timeStr : `${timeStr}Z`);
  return time.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

export const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "";
  const date = new Date(dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const convertToOptions = <T,>(
  data: T[] | any,
  label: keyof T,
  value: keyof T,
  notAllowedValues?: any[],
  notAllowedLabels?: any[]
): { value: string; label: string }[] => {
  return (data || [])
    .map((item: T) => ({
      value: item[value],
      label: item[label],
    }))
    .filter((item: { value: any }) => !notAllowedValues || !notAllowedValues.includes(item.value))
    .filter((item: { label: any }) => !notAllowedLabels || !notAllowedLabels.includes(item.label));
};

export const printLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

const padNumber = (num: number) => {
  return num.toString().padStart(2, "0");
};

export const toInputFieldTime = (time: string) => {
  if (!time) return new Date().toISOString().slice(0, 16);
  const date = new Date(time);
  return date.toISOString().slice(0, 16);
};

export const formatDuration = (duration: number) => {
  if (duration < 60) {
    return `${duration} secs`;
  }
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes} min${minutes > 1 ? "s" : ""} ${seconds} sec${seconds > 1 ? "s" : ""}`;
};
