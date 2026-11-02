"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      message = json.message || json.error || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get<T = unknown>(path: string): Promise<T> {
    return fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<T>(r));
  },
  post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((r) => handleResponse<T>(r));
  },
  put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((r) => handleResponse<T>(r));
  },
  delete<T = unknown>(path: string): Promise<T> {
    return fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<T>(r));
  },
};
