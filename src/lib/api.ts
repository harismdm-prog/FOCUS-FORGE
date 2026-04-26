import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE = "/api";

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error (${res.status}): ${text.slice(0, 100)}`);
  }
  return res.json();
}

export async function fetchUser(email: string) {
  const res = await fetch(`${API_BASE}/user/${email}`);
  return handleResponse(res);
}

export async function saveSession(userId: string, duration: number, completed: boolean) {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, duration, completed }),
  });
  return handleResponse(res);
}

export async function fetchStats(userId: string) {
  const res = await fetch(`${API_BASE}/stats/${userId}`);
  return handleResponse(res);
}

export async function fetchBlockedSites(userId: string) {
  const res = await fetch(`${API_BASE}/blocked-sites/${userId}`);
  return handleResponse(res);
}

export async function addBlockedSite(userId: string, url: string) {
  const res = await fetch(`${API_BASE}/blocked-sites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, url }),
  });
  return handleResponse(res);
}

export async function removeBlockedSite(id: string) {
  const res = await fetch(`${API_BASE}/blocked-sites/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API Error (${res.status})`);
}

export async function fetchBlockedApps(userId: string) {
  const res = await fetch(`${API_BASE}/blocked-apps/${userId}`);
  return handleResponse(res);
}

export async function addBlockedApp(userId: string, name: string) {
  const res = await fetch(`${API_BASE}/blocked-apps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, name }),
  });
  return handleResponse(res);
}

export async function removeBlockedApp(id: string) {
  const res = await fetch(`${API_BASE}/blocked-apps/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API Error (${res.status})`);
}

export async function fetchBlockedMobileApps(userId: string) {
  const res = await fetch(`${API_BASE}/blocked-mobile-apps/${userId}`);
  return handleResponse(res);
}

export async function addBlockedMobileApp(userId: string, name: string) {
  const res = await fetch(`${API_BASE}/blocked-mobile-apps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, name }),
  });
  return handleResponse(res);
}

export async function removeBlockedMobileApp(id: string) {
  const res = await fetch(`${API_BASE}/blocked-mobile-apps/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API Error (${res.status})`);
}

export async function updateUser(id: string, updates: any) {
  const res = await fetch(`${API_BASE}/user/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

export async function resetStats(userId: string) {
  const res = await fetch(`${API_BASE}/stats/${userId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API Error (${res.status})`);
}
