export type ApiRequestSnapshot = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
};

export type ApiSuccess<TData> = {
  ok: true;
  data: TData;
  request: ApiRequestSnapshot;
};

export type ApiFailure = {
  ok: false;
  error: string;
  statusCode?: number;
  code?: string;
  request: ApiRequestSnapshot;
};

export type ApiResult<TData> = ApiSuccess<TData> | ApiFailure;

type RequestOptions<TBody> = {
  query?: Record<string, string | number | boolean | undefined>;
  body?: TBody;
  headers?: Record<string, string>;
};

const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }

  return 'http://localhost:4000/api/v1';
};

const buildUrl = (
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
) => {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url;
};

const normalizeMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const body = payload as {
    message?: unknown;
    error?: unknown;
    code?: unknown;
  };
  const message = body.message ?? body.error;

  if (Array.isArray(message)) {
    return message.map((item) => String(item)).join(', ');
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  if (typeof body.code === 'string' && body.code.trim().length > 0) {
    return body.code;
  }

  return fallback;
};

const readJson = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return response.text();
  }

  return response.json() as Promise<unknown>;
};

export const requestJson = async <TData, TBody = undefined>(
  method: ApiRequestSnapshot['method'],
  path: string,
  options?: RequestOptions<TBody>,
): Promise<ApiResult<TData>> => {
  const url = buildUrl(path, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options?.body !== undefined
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(options?.headers ?? {}),
  };

  const request: ApiRequestSnapshot = {
    method,
    url: url.toString(),
    headers,
    query:
      options?.query && Object.keys(options.query).length > 0
        ? Object.fromEntries(
            Object.entries(options.query)
              .filter(([, value]) => value !== undefined)
              .map(([key, value]) => [key, String(value)]),
          )
        : undefined,
    body: options?.body,
  };

  try {
    const response = await fetch(url, {
      method,
      credentials: 'include',
      headers,
      body:
        options?.body === undefined ? undefined : JSON.stringify(options.body),
    });

    const payload = await readJson(response);

    if (!response.ok) {
      return {
        ok: false,
        statusCode: response.status,
        code:
          typeof payload === 'object' && payload && 'code' in payload
            ? String((payload as { code?: unknown }).code ?? '')
            : undefined,
        error: normalizeMessage(
          payload,
          response.statusText || 'Request failed',
        ),
        request,
      };
    }

    return {
      ok: true,
      data: payload as TData,
      request,
    };
  } catch {
    return {
      ok: false,
      error: 'Unable to reach the API.',
      request,
    };
  }
};

export const getJson = <TData>(path: string, options?: RequestOptions<never>) =>
  requestJson<TData>('GET', path, options);

export const postJson = <TData, TBody = undefined>(
  path: string,
  options?: RequestOptions<TBody>,
) => requestJson<TData, TBody>('POST', path, options);

export const patchJson = <TData, TBody = undefined>(
  path: string,
  options?: RequestOptions<TBody>,
) => requestJson<TData, TBody>('PATCH', path, options);

export const deleteJson = <TData>(
  path: string,
  options?: RequestOptions<never>,
) => requestJson<TData>('DELETE', path, options);

export const withIdempotencyKey = (idempotencyKey: string) => ({
  'Idempotency-Key': idempotencyKey,
});
