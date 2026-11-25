import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export async function getAuthToken(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("kp_auth_token")?.value;
  } catch {
    // Dipanggil di browser / client context
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/kp_auth_token=([^;]+)/);
      return match ? match[1] : undefined;
    }
    return undefined;
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const headers = new Headers(options.headers || {});

  // Ambil token dan pasang di header Authorization
  const token = await getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Jika body bukan FormData, pasang header Content-Type application/json
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      cache: options.cache || "no-store",
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`[apiClient Error] ${endpoint}:`, error);
    return {
      success: false,
      error: error.message || "Gagal menghubungi server backend",
      code: "NETWORK_ERROR",
    };
  }
}
