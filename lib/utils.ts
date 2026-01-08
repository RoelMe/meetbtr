// In a real project with 'clsx' and 'tailwind-merge', you would use:
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

// For this runnable preview, we use a simple joiner:
// export function cn(...classes) {
//    return classes.filter(Boolean).join(" ");
//  }