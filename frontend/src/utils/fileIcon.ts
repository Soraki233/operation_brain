import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCode,
  FileArchive,
  FileQuestion,
  File as FileIcon,
  Presentation,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { FileKind } from '@/types/knowledge'

export function getFileKindByName(name: string): FileKind {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['pdf'].includes(ext)) return 'pdf'
  if (['doc', 'docx', 'rtf'].includes(ext)) return 'word'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel'
  if (['ppt', 'pptx'].includes(ext)) return 'ppt'
  if (['md', 'markdown', 'mdx'].includes(ext)) return 'markdown'
  if (['txt', 'log'].includes(ext)) return 'txt'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  return 'other'
}

interface KindMeta {
  icon: Component
  label: string
  /** tailwind text color utility for the icon */
  color: string
  /** tailwind bg color utility for the icon box */
  bg: string
}

export const FILE_KIND_META: Record<FileKind, KindMeta> = {
  pdf: {
    icon: FileText,
    label: 'PDF',
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-500/10',
  },
  word: {
    icon: FileText,
    label: 'Word',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },
  excel: {
    icon: FileSpreadsheet,
    label: 'Excel',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  ppt: {
    icon: Presentation,
    label: 'PPT',
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
  },
  markdown: {
    icon: FileCode,
    label: 'Markdown',
    color: 'text-slate-700',
    bg: 'bg-slate-100 dark:bg-slate-500/10',
  },
  txt: {
    icon: FileText,
    label: 'TXT',
    color: 'text-slate-600',
    bg: 'bg-slate-100 dark:bg-slate-500/10',
  },
  image: {
    icon: FileImage,
    label: '图片',
    color: 'text-fuchsia-600',
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10',
  },
  other: {
    icon: FileQuestion,
    label: '其他',
    color: 'text-slate-500',
    bg: 'bg-slate-100 dark:bg-slate-500/10',
  },
}

export function getFileMeta(name: string): KindMeta {
  return FILE_KIND_META[getFileKindByName(name)]
}

export { FileIcon, FileArchive }
