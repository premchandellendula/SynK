import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
};


export const timeAgo = (timeCreated: string | Date): string => {
  const now = new Date();
  const created = new Date(timeCreated)
  const timeDiff = now.getTime() - created.getTime();

  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if(seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  if(minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if(hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if(days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if(weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

const funColors = [
  'bg-rose-200/50',
  'bg-lime-200/50',
  'bg-sky-200/50',
  'bg-orange-200/50',
  'bg-violet-200/50',
  'bg-emerald-200/50',
  'bg-fuchsia-200/50',
  'bg-indigo-200/50',
  'bg-cyan-200/50',
];

export const getFunBg = (rank: number) => funColors[(rank - 1) % funColors.length] || 'bg-muted/30';
