import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Counter for generating unique IDs
let idCounter = 0;

/**
 * Generates a unique ID combining timestamp, random component, and counter
 * This prevents ID collisions when creating multiple items quickly
 */
export function generateUniqueId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  const counter = (idCounter++).toString(36);

  // Reset counter if it gets too large
  if (idCounter > 46655) {
    // 36^3 - 1
    idCounter = 0;
  }

  return `${timestamp}_${random}_${counter}`;
}
