import type { FileStatus } from '@/types/knowledge'

export interface StatusMeta {
  label: string
  /** tailwind bg for pill */
  bg: string
  /** tailwind text for pill */
  text: string
  /** dot color */
  dot: string
  /** whether pulse animation */
  pulse?: boolean
}

export const STATUS_META: Record<FileStatus, StatusMeta> = {
  parsing: {
    label: '解析中',
    bg: 'bg-brand-soft',
    text: 'text-brand-soft-foreground',
    dot: 'bg-brand',
    pulse: true,
  },
  ready: {
    label: '已完成',
    bg: 'bg-success-soft',
    text: 'text-success',
    dot: 'bg-success',
  },
  failed: {
    label: '失败',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    dot: 'bg-destructive',
  },
}

export function getStatusMeta(s: FileStatus): StatusMeta {
  return STATUS_META[s]
}
