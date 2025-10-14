import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const thousandFormatter = (value: number): string => {
  return value >= 1000 ? value / 1000 + "k" : value.toString();
};
