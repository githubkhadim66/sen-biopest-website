const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null);
  let message: string | undefined;
  if (body) {
    // class-validator returns an array of messages
    message = Array.isArray(body.message) ? body.message.join(' · ') : body.message;
  }
  if (!message) {
    message =
      res.status === 429
        ? 'Trop de tentatives. Merci de patienter une minute.'
        : res.status >= 500
          ? 'Erreur serveur. Veuillez réessayer.'
          : `Erreur ${res.status}`;
  }
  return new ApiError(message, res.status);
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshing: Promise<boolean> | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
  }

  getToken() {
    return this.accessToken;
  }

  private async send(path: string, init: RequestInit, json: boolean): Promise<Response> {
    const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
    if (json) headers['Content-Type'] = 'application/json';
    if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`;
    return fetch(`${API_URL}${path}`, { ...init, headers, credentials: 'include' });
  }

  private async request<T>(path: string, init: RequestInit = {}, json = true): Promise<T> {
    let res = await this.send(path, init, json);

    // Access token expired: refresh once (shared between concurrent calls) and retry
    if (res.status === 401 && this.accessToken && !path.startsWith('/auth/')) {
      if (await this.refreshToken()) res = await this.send(path, init, json);
    }

    if (!res.ok) throw await toApiError(res);
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  private refreshToken(): Promise<boolean> {
    if (!this.refreshing) {
      this.refreshing = fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
        .then(async (res) => {
          if (!res.ok) return false;
          const data = await res.json();
          this.accessToken = data.accessToken;
          return true;
        })
        .catch(() => false)
        .then((ok) => {
          if (!ok) this.accessToken = null;
          this.refreshing = null;
          return ok;
        });
    }
    return this.refreshing;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  upload<T>(path: string, formData: FormData): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: formData }, false);
  }
}

export const api = new ApiClient();
