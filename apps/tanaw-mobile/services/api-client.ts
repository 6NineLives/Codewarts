import { getApiBaseUrl, getApiBaseUrlCandidates } from '@/services/api-config';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  timeoutMs?: number;
};

let resolvedBaseUrl: string | null = null;

async function fetchWithBase<T>(
  baseUrl: string,
  path: string,
  options: RequestOptions,
): Promise<T> {
  const { method = 'GET', body, timeoutMs = 15000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => response.statusText);
      throw new ApiError(detail || `Request failed (${response.status})`, response.status);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Tries each candidate host until one responds (same machine as Expo dev server). */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const candidates = resolvedBaseUrl
    ? [resolvedBaseUrl, ...getApiBaseUrlCandidates().filter((url) => url !== resolvedBaseUrl)]
    : getApiBaseUrlCandidates();

  let lastError: unknown;

  for (const baseUrl of candidates) {
    try {
      const result = await fetchWithBase<T>(baseUrl, path, options);
      resolvedBaseUrl = baseUrl;
      return result;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof ApiError) throw lastError;
  throw new ApiError('Network request failed — is uvicorn running on port 8000?', 0);
}

export function getResolvedApiBaseUrl(): string | null {
  return resolvedBaseUrl;
}
