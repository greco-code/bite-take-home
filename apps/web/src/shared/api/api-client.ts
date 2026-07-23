import { apiErrorResponseSchema, type ApiErrorResponse } from '@bite/contracts';

type ResponseSchema<T> = Readonly<{
  parse: (value: unknown) => T;
}>;

type ApiClientErrorCode =
  ApiErrorResponse['error']['code'] | 'INVALID_RESPONSE' | 'NETWORK_ERROR';

const getApiBaseUrl = (): string => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '');

  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  return apiBaseUrl;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: ApiClientErrorCode,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiRequest = async <T>(
  path: string,
  schema: ResponseSchema<T>,
  options?: RequestInit,
): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, options);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    throw new ApiError(
      'We could not reach the server. Check your connection and try again.',
      0,
      'NETWORK_ERROR',
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new ApiError(
      response.ok
        ? 'The server returned an unexpected response.'
        : 'The request could not be completed.',
      response.status,
      'INVALID_RESPONSE',
    );
  }

  if (!response.ok) {
    const apiError = apiErrorResponseSchema.safeParse(payload);

    throw new ApiError(
      apiError.success
        ? apiError.data.error.message
        : 'The request could not be completed.',
      response.status,
      apiError.success ? apiError.data.error.code : 'INVALID_RESPONSE',
    );
  }

  try {
    return schema.parse(payload);
  } catch {
    throw new ApiError(
      'The server returned an unexpected response.',
      response.status,
      'INVALID_RESPONSE',
    );
  }
};
