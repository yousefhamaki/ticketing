/*
 * useBasicMutation: POST through an apiId.
 * Body shape of every `..._dml` service:
 *   { authorization, planguageid, data: [ { ... } ] }
 * The login service is the one exception (no authorization yet), so the caller
 * passes `excludeAuthorization` and a flat body.
 */
import { useCallback, useState } from "react";
import { postRequest, ApiIdType, RecordType, ERROR_CODES } from "../api";
import { useAppConfig } from "../store";

interface MutationResponseType<T = any> {
  apiValues: T;
  error: string;
  errorCode: number;
  status: number;
}

interface UseBasicMutationProps<T> {
  apiId: ApiIdType;
  excludeAuthorization?: boolean;
  /* true  -> body is sent as given (login / logout) */
  /* false -> body is wrapped in { authorization, planguageid, data: [body] } */
  flatBody?: boolean;
  onResponse?: (response: MutationResponseType<T>) => void;
}

const useBasicMutation = <T = any>({
  apiId,
  excludeAuthorization,
  flatBody,
  onResponse,
}: UseBasicMutationProps<T>) => {
  const { authorization, languageId, clearSession } = useAppConfig();
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    async (
      body: RecordType,
      cb?: (response: MutationResponseType<T>) => void,
    ) => {
      setLoading(true);

      const finalBody: RecordType = flatBody
        ? { planguageid: languageId, ...body }
        : {
            ...(excludeAuthorization ? {} : { authorization }),
            planguageid: languageId,
            data: [body],
          };

      if (flatBody && !excludeAuthorization) {
        finalBody.authorization = authorization;
      }

      const { data, error, errorCode, status } = await postRequest(
        apiId,
        finalBody,
      );

      setLoading(false);

      if (errorCode === ERROR_CODES.SESSION_EXPIRED) {
        clearSession();
      }

      const response = {
        apiValues: data as T,
        error,
        errorCode,
        status,
      };

      if (cb) {
        cb(response);
      }
      if (onResponse) {
        onResponse(response);
      }

      return response;
    },
    [
      apiId,
      authorization,
      languageId,
      excludeAuthorization,
      flatBody,
      onResponse,
      clearSession,
    ],
  );

  return { loading, mutate };
};

export default useBasicMutation;
