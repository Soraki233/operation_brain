<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  CloudUpload,
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useFileUpload, ACCEPTED_EXTS } from '../composables/useFileUpload'
import { formatFileSize } from '@/utils/format'
import type { KbScope } from '@/types/knowledge'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  folderId: string | null
  folderName?: string
  scope: KbScope
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'uploaded'): void
}>()

const { tasks, uploading, addFiles, runAll, reset, remove, hasPending } = useFileUpload()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

watch(
  () => props.open,
  (v) => {
    if (v) reset()
  },
)

const acceptAttr = ACCEPTED_EXTS.join(',')

const canStart = computed(() => hasPending() && !uploading.value && !!props.folderId)
const allDone = computed(
  () => tasks.value.length > 0 && tasks.value.every((t) => t.status !== 'queued' && t.status !== 'uploading'),
)

function pickFiles() {
  inputRef.value?.click()
}

function onInputChange(e: Event) {
  const el = e.target as HTMLInputElement
  if (el.files && props.folderId) {
    addFiles(el.files, props.folderId, props.scope)
    el.value = ''
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && props.folderId) {
    addFiles(files, props.folderId, props.scope)
  }
}

async function start() {
  if (!canStart.value) return
  await runAll(() => emit('uploaded'))
  // final notify
  emit('uploaded')
}

function close() {
  if (uploading.value) return
  emit('update:open', false)
}

function statusIcon(status: string) {
  if (status === 'uploading') return Loader2
  if (status === 'parsing') return Loader2
  if (status === 'ready') return CheckCircle2
  if (status === 'failed') return AlertTriangle
  return FileText
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <CloudUpload class="size-[18px] text-brand" /> 上传文件
        </DialogTitle>
        <DialogDescription>
          上传至
          <span class="font-medium text-foreground">{{ folderName || '当前目录' }}</span>
          · 支持 PDF / Word / Excel / PPT / Markdown / TXT · 单文件最大 50MB
        </DialogDescription>
      </DialogHeader>

      <!-- Drop zone -->
      <div
        :class="
          cn(
            'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors cursor-pointer text-center',
            isDragging
              ? 'border-brand bg-brand-soft/40'
              : 'border-border hover:border-brand/50 hover:bg-muted/40',
          )
        "
        @click="pickFiles"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop="onDrop"
      >
        <div class="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
          <UploadCloud class="size-6" />
        </div>
        <p class="mt-3 text-sm font-medium">
          拖拽文件到此，或
          <span class="text-brand">点击选择文件</span>
        </p>
        <p class="mt-1 text-xs text-muted-foreground">
          支持批量选择，上传后会自动解析
        </p>
        <input
          ref="inputRef"
          type="file"
          multiple
          class="hidden"
          :accept="acceptAttr"
          @change="onInputChange"
        />
      </div>

      <!-- Task list -->
      <div v-if="tasks.length" class="max-h-[240px] overflow-y-auto ob-scrollbar -mx-1 px-1 space-y-2">
        <div
          v-for="t in tasks"
          :key="t.id"
          class="rounded-lg border bg-card p-3"
        >
          <div class="flex items-center gap-2.5">
            <component
              :is="statusIcon(t.status)"
              :class="[
                'size-4 shrink-0',
                t.status === 'uploading' || t.status === 'parsing' ? 'animate-spin text-brand' : '',
                t.status === 'ready' && 'text-success',
                t.status === 'failed' && 'text-destructive',
                t.status === 'queued' && 'text-muted-foreground',
              ]"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="truncate text-sm font-medium">{{ t.file.name }}</span>
                <span class="text-[11px] text-muted-foreground shrink-0">
                  {{ formatFileSize(t.file.size) }}
                </span>
              </div>
              <div
                v-if="t.status === 'uploading'"
                class="mt-1.5"
              >
                <Progress :model-value="t.progress" class="h-1" />
              </div>
              <div v-else-if="t.status === 'parsing'" class="mt-1 text-[11px] text-brand">
                解析中…
              </div>
              <div v-else-if="t.status === 'ready'" class="mt-1 text-[11px] text-success">
                上传成功，等待解析完成
              </div>
              <div v-else-if="t.status === 'failed'" class="mt-1 text-[11px] text-destructive">
                {{ t.errorMessage || '上传失败' }}
              </div>
              <div v-else-if="t.status === 'queued'" class="mt-1 text-[11px] text-muted-foreground">
                等待上传
              </div>
            </div>
            <button
              v-if="t.status !== 'uploading'"
              class="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer"
              @click="remove(t.id)"
            >
              <X class="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="uploading" @click="close">
          {{ allDone ? '完成' : '取消' }}
        </Button>
        <Button :disabled="!canStart" @click="start">
          <Loader2 v-if="uploading" class="size-4 animate-spin" />
          <UploadCloud v-else class="size-4" />
          {{ uploading ? '上传中…' : '开始上传' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
