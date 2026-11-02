export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem("adminToken", token);
}

export function removeToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem("adminToken");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
