/// <reference types="vite/client" />

declare module 'axios' {
  export interface AxiosInstance {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  }

  export interface AxiosRequestConfig {
    url?: string;
    method?: string;
    baseURL?: string;
    headers?: any;
    params?: any;
    data?: any;
    timeout?: number;
    withCredentials?: boolean;
    responseType?: string;
    onUploadProgress?: (progressEvent: any) => void;
    onDownloadProgress?: (progressEvent: any) => void;
    auth?: {
      username: string;
      password: string;
    };
    validateStatus?: (status: number) => boolean;
    maxRedirects?: number;
  }

  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
    request?: any;
  }

  export interface AxiosError<T = any> extends Error {
    config: AxiosRequestConfig;
    code?: string;
    request?: any;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
    toJSON: () => object;
  }

  export function create(config?: AxiosRequestConfig): AxiosInstance;
  export function all<T>(values: (T | Promise<T>)[]): Promise<T[]>;
  export function spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R;
  export function isCancel(value: any): boolean;
  export function isAxiosError(payload: any): payload is AxiosError;

  const axios: AxiosInstance & {
    create: typeof create;
    all: typeof all;
    spread: typeof spread;
    isCancel: typeof isCancel;
    isAxiosError: typeof isAxiosError;
    CancelToken: {
      source(): {
        token: any;
        cancel: (message?: string) => void;
      };
    };
  };

  export default axios;
}
