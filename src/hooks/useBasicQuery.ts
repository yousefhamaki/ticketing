/*
 * useBasicQuery: GET through an apiId, same contract as
 * `@app-structure/network-hooks` in cure-plus-fe.
 *
 * It adds `authorization` and `planguageid` to every call, keeps `poffset` /
 * `poffset_step` for paging, and hands the screen { apiValues, error, status }.
 * Session end (-20800) and forced password change (-20803) are handled here so
 * no screen repeats them.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { getRequest, ApiIdType, RecordType, ERROR_CODES } from "../api";
import { useAppConfig } from "../store";

interface QueryResponseType<T = any> {
  apiValues: T;
  error: string;
  errorCode: number;
  status: number;
}

interface BasicQueryConfigProps<T> {
  apiId: ApiIdType;
  params?: RecordType;
  callOnFirstRender?: boolean;
  excludeAuthorization?: boolean;
  withLanguageParam?: boolean;
  onResponse?: (response: QueryResponseType<T>) => void;
}

const useBasicQuery = <T = any>({
  apiId,
  params,
  callOnFirstRender,
  excludeAuthorization,
  withLanguageParam = true,
  onResponse,
}: BasicQueryConfigProps<T>) => {
  const { authorization, languageId, clearSession } = useAppConfig();
  const [loading, setLoading] = useState(false);
  const [queryError, setQueryError] = useState("");

  const onResponseRef = useRef(onResponse);
  onResponseRef.current = onResponse;
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const calledOnFirstRender = useRef(false);

  const runQuery = useCallback(
    async (nextParams?: RecordType) => {
      if (!excludeAuthorization && !authorization) {
        return;
      }

      setLoading(true);
      setQueryError("");

      const allParams: RecordType = {
        ...(paramsRef.current || {}),
        ...(nextParams || {}),
      };

      if (!excludeAuthorization) {
        allParams.authorization = authorization;
      }
      if (withLanguageParam) {
        allParams.planguageid = languageId;
      }

      const { data, error, errorCode, status } = await getRequest(
        apiId,
        allParams,
      );

      setLoading(false);

      if (errorCode === ERROR_CODES.SESSION_EXPIRED) {
        clearSession();
        return;
      }

      if (error) {
        setQueryError(error);
      }

      if (onResponseRef.current) {
        onResponseRef.current({
          apiValues: data as T,
          error,
          errorCode,
          status,
        });
      }
    },
    [
      apiId,
      authorization,
      languageId,
      excludeAuthorization,
      withLanguageParam,
      clearSession,
    ],
  );

  useEffect(() => {
    if (callOnFirstRender && !calledOnFirstRender.current) {
      calledOnFirstRender.current = true;
      runQuery();
    }
  }, [callOnFirstRender, runQuery]);

  return { loading, runQuery, queryError };
};

export default useBasicQuery;
