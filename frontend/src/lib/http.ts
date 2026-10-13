export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface HttpClient {
  request<T>(path: string, options?: RequestInit): Promise<T>;
}

export class FetchHttpClient implements HttpClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      cache: "no-store",
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const details = body?.error?.details as { message: string }[] | undefined;
      throw new ApiError(
        response.status,
        details?.[0]?.message ??
          body?.error?.message ??
          "Unable to complete this request.",
      );
    }
    return response.json() as Promise<T>;
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
