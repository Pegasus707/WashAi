import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hapticFeedback(style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [40],
      success: [10, 30, 10],
      warning: [30, 50, 30],
      error: [50, 100, 50, 100, 50],
    };
    window.navigator.vibrate(patterns[style]);
  }
}
