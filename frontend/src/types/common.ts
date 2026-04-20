export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

export interface PageQuery {
  page: number
  pageSize: number
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type Nullable<T> = T | null | undefined

export type AsyncState = 'idle' | 'loading' | 'success' | 'error'

export interface OptionItem<V = string> {
  label: string
  value: V
  disabled?: boolean
}
