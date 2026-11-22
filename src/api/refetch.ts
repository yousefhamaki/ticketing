/*
 * refetch: the only place that talks to the network, same shape as
 * `@app-structure/refetch` in cure-plus-fe.
 *
 * Every ETKT service answers one of:
 *   GET  -> { "data": [ ... ] }                 (total on every row)
 *   POST -> { "status": "success", "rows": n, "data": [ ... ] }
 *   any  -> { "status": "failure", "error_code": n, "error_message": "..." }
 * so the error is read from ONE field in the caller's language.
 */
import { API_IDS, ApiIdType } from "./apiIds";

export const BASE_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export interface RequestResponse<T = any> {
  data: T;
  error: string;
  errorCode: number;
  status: number;
}

export type RecordType = { [key: string]: any };

const baseApiUrl = (
  process.env.REACT_APP_BASE_API_URL || "/ords/etkt"
).replace(/\/$/, "");

const buildUrl = (apiId: ApiIdType, params?: RecordType) => {
  const search = new URLSearchParams();

  Object.keys(params || {}).forEach((key) => {
    const value = (params as RecordType)[key];
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  });

  const query = search.toString();
  return `${baseApiUrl}/${API_IDS[apiId]}${query ? `?${query}` : ""}`;
};

const resolveResponse = async (
  response: Response,
): Promise<RequestResponse> => {
  let body: RecordType = {};

  try {
    body = await response.json();
  } catch (error) {
    body = {};
  }

  // the packages answer a business failure with HTTP 200 + status failure,
  // and ORDS answers an unhandled one with 4xx / 5xx + the same three fields.
  const failed = !response.ok || body.status === "failure";

  return {
    data: body,
    error: failed
      ? body.error_message || body.message || `HTTP ${response.status}`
      : "",
    errorCode: Number(body.error_code || 0),
    status: response.status,
  };
};

export const getRequest = async (
  apiId: ApiIdType,
  params?: RecordType,
): Promise<RequestResponse> => {
  try {
    const response = await fetch(buildUrl(apiId, params), {
      method: "GET",
      headers: BASE_HEADERS,
    });
    return await resolveResponse(response);
  } catch (error) {
    return {
      data: {},
      error: (error as Error).message,
      errorCode: 0,
      status: 0,
    };
  }
};

export const postRequest = async (
  apiId: ApiIdType,
  body: RecordType,
): Promise<RequestResponse> => {
  try {
    const response = await fetch(buildUrl(apiId), {
      method: "POST",
      headers: BASE_HEADERS,
      body: JSON.stringify(body),
    });
    return await resolveResponse(response);
  } catch (error) {
    return {
      data: {},
      error: (error as Error).message,
      errorCode: 0,
      status: 0,
    };
  }
};
