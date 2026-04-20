import { ref } from 'vue'
import type { KbScope, UploadTask } from '@/types/knowledge'
import { knowledgeApi } from '@/api'

export const ACCEPTED_EXTS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.md', '.markdown', '.txt']
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function useFileUpload() {
  const tasks = ref<UploadTask[]>([])
  const uploading = ref(false)

  function validate(file: File): string | null {
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
    if (!ACCEPTED_EXTS.includes(ext)) return `不支持的格式：${ext || file.name}`
    if (file.size > MAX_FILE_SIZE) return '文件超过 50MB 限制'
    return null
  }

  function addFiles(files: FileList | File[], folderId: string, scope: KbScope) {
    const list = Array.from(files)
    for (const file of list) {
      const err = validate(file)
      const task: UploadTask = {
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        folderId,
        scope,
        progress: 0,
        status: err ? 'failed' : 'queued',
        errorMessage: err ?? undefined,
      }
      tasks.value.push(task)
    }
  }

  async function runAll(onFileDone?: () => void) {
    uploading.value = true
    try {
      for (const t of tasks.value) {
        if (t.status !== 'queued') continue
        t.status = 'uploading'
        try {
          const result = await knowledgeApi.uploadFile(
            { folderId: t.folderId, scope: t.scope, file: t.file },
            (p) => {
              t.progress = p
            },
          )
          t.serverFileId = result.id
          t.progress = 100
          t.status = 'parsing'
          onFileDone?.()
        } catch (e) {
          t.status = 'failed'
          t.errorMessage = e instanceof Error ? e.message : '上传失败'
        }
      }
    } finally {
      uploading.value = false
    }
  }

  function reset() {
    tasks.value = []
  }

  function remove(id: string) {
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  const hasPending = () => tasks.value.some((t) => t.status === 'queued')
  const hasFailures = () => tasks.value.some((t) => t.status === 'failed')
  const allDone = () => tasks.value.length > 0 && tasks.value.every((t) => t.status !== 'queued' && t.status !== 'uploading')

  return {
    tasks,
    uploading,
    addFiles,
    runAll,
    reset,
    remove,
    hasPending,
    hasFailures,
    allDone,
    ACCEPTED_EXTS,
    MAX_FILE_SIZE,
  }
}
