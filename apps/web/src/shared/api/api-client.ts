import { apiErrorResponseSchema } from '@bite/contracts';

type ResponseSchema<T> = Readonly<{
  parse: (value: unknown) => T;
}>;

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
  const response = await fetch(`${getApiBaseUrl()}${path}`, options);
  const payload: unknown = await response.json();

  if (!response.ok) {
    const apiError = apiErrorResponseSchema.safeParse(payload);

    throw new ApiError(
      apiError.success
        ? apiError.data.error.message
        : 'The request could not be completed.',
      response.status,
    );
  }

  return schema.parse(payload);
};
