import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'vue-sonner'
import type { ApiResponse } from '@/types/common'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api'
const TIMEOUT = 20_000

const TOKEN_KEY = 'opsbrain_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
  },
  (error) => Promise.reject(error),
)

http.interceptors.response.use(
  (res: AxiosResponse<ApiResponse<unknown>>) => {
    const body = res.data
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0 || body.code === 200) {
        return res
      }
      const msg = body.message || '请求失败'
      toast.error(msg)
      if (body.code === 401) {
        clearToken()
        if (!location.pathname.startsWith('/login')) {
          location.replace('/login')
        }
      }
      return Promise.reject(new Error(msg))
    }
    return res
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status
    const msg =
      error.response?.data?.message ||
      (status === 401
        ? '登录已过期，请重新登录'
        : status === 403
          ? '无权访问该资源'
          : status === 404
            ? '资源不存在'
            : status && status >= 500
              ? '服务器开小差了，请稍后再试'
              : error.message || '网络异常')
    toast.error(msg)
    if (status === 401) {
      clearToken()
      if (!location.pathname.startsWith('/login')) {
        location.replace('/login')
      }
    }
    return Promise.reject(error)
  },
)

export interface UploadOptions extends AxiosRequestConfig {
  onProgress?: (percent: number) => void
  field?: string
  extraFields?: Record<string, string | Blob>
}

async function unwrap<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const res = await promise
  return res.data.data
}

export const request = {
  get<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig) {
    return unwrap<T>(http.get(url, { ...config, params }))
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrap<T>(http.post(url, data, config))
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrap<T>(http.put(url, data, config))
  },
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrap<T>(http.patch(url, data, config))
  },
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return unwrap<T>(http.delete(url, config))
  },
  upload<T>(url: string, file: File, options: UploadOptions = {}) {
    const { onProgress, field = 'file', extraFields, ...rest } = options
    const form = new FormData()
    form.append(field, file)
    if (extraFields) {
      for (const [k, v] of Object.entries(extraFields)) form.append(k, v)
    }
    return unwrap<T>(
      http.post(url, form, {
        ...rest,
        headers: { 'Content-Type': 'multipart/form-data', ...rest.headers },
        onUploadProgress: (e) => {
          if (e.total && onProgress) {
            onProgress(Math.round((e.loaded * 100) / e.total))
          }
        },
      }),
    )
  },
}

export default http
