import { AxiosError, type AxiosRequestConfig } from 'axios';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { ApolloError } from 'apollo-server-errors';

type FetchedError = {
  response?: {
    url?: string;
    status?: number;
    statusText?: string;
    body?: unknown;
  };
  code?: string;
  stacktrace?: string[];
};

// make all properties of T writeable
type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export function formatGraphqlError(error: GraphQLError): GraphQLFormattedError {
  const { message, path, locations, extensions } = error;
  const formattedError: Writeable<GraphQLFormattedError> = {
    message,
    path,
    locations,
    extensions,
  };

  if (error.originalError && error.originalError instanceof AxiosError) {
    const axiosError = error.originalError;
    const data: unknown = axiosError.response?.data;

    let status = 500;
    if (axiosError.code === 'ECONNREFUSED') {
      status = 503;
    }
    if (axiosError.response) {
      status = axiosError.response.status;
    }

    const config: Partial<AxiosRequestConfig> = axiosError.config ?? {};
    const url = config.url;
    const baseURL = config.baseURL;
    const method = config.method;
    const safeParams: unknown = config.params;
    const safeData: unknown = data;

    // overwrite extensions property to avoid exposing the original error
    formattedError.extensions = {
      config: {
        url,
        params: safeParams,
        baseURL,
        method,
        data: safeData,
        status,
      },
    };
  }

  if (error.originalError && error.originalError instanceof ApolloError) {
    const response = error.originalError.extensions?.response as
      | {
          url?: string;
          status?: number;
          statusText?: string;
          body?: unknown;
        }
      | undefined;

    if (response) {
      const { url, status, statusText, body } = response;

      // overwrite extensions property to avoid exposing the original error
      formattedError.extensions = {
        config: {
          url,
          statusCode: status,
          error: statusText,
          data: body,
        },
        response: {
          url,
          status,
          statusText,
        },
      };
    }
  }

  // handle errors for RESTDataSource
  const fetchedResponse = (extensions as FetchedError | undefined)?.response;
  if (fetchedResponse) {
    const { url, status, statusText, body } = fetchedResponse;

    formattedError.extensions = {
      config: {
        url,
        statusCode: status,
        error: statusText,
        data: body,
      },
      response: {
        url,
        status,
        statusText,
      },
    };
  }

  return formattedError;
}
