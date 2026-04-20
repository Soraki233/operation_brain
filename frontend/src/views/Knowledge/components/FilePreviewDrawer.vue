<script setup lang="ts">
import { computed } from 'vue'
import {
  Download,
  Bot,
  Trash2,
  ExternalLink,
  FileSearch,
} from 'lucide-vue-next'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { KbFile } from '@/types/knowledge'
import { getFileMeta } from '@/utils/fileIcon'
import { formatFileSize, formatDateTime } from '@/utils/format'
import { getStatusMeta } from '../utils/statusMap'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  file: KbFile | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'delete', file: KbFile): void
}>()

const meta = computed(() => (props.file ? getFileMeta(props.file.name) : null))
const status = computed(() => (props.file ? getStatusMeta(props.file.status) : null))
</script>

<template>
  <Sheet :open="open" @update:open="(v) => emit('update:open', v)">
    <SheetContent class="w-full sm:max-w-[560px] p-0 flex flex-col">
      <SheetHeader class="p-5 border-b">
        <div class="flex items-start gap-3">
          <div
            v-if="meta"
            :class="cn('flex size-11 items-center justify-center rounded-xl shrink-0', meta.bg)"
          >
            <component :is="meta.icon" :class="cn('size-6', meta.color)" />
          </div>
          <div class="flex-1 min-w-0">
            <SheetTitle class="truncate text-base">
              {{ file?.name || '文件详情' }}
            </SheetTitle>
            <SheetDescription class="mt-0.5">
              文件预览与基础信息
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div v-if="file" class="flex-1 overflow-y-auto ob-scrollbar p-5 space-y-5">
        <!-- Info grid -->
        <section class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <div class="text-xs text-muted-foreground">类型</div>
            <div class="mt-0.5 font-medium">{{ meta?.label }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">大小</div>
            <div class="mt-0.5 font-medium tabular-nums">{{ formatFileSize(file.size) }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">上传时间</div>
            <div class="mt-0.5">{{ formatDateTime(file.uploadedAt) }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">上传人</div>
            <div class="mt-0.5">{{ file.uploadedBy }}</div>
          </div>
          <div class="col-span-2">
            <div class="text-xs text-muted-foreground">状态</div>
            <div class="mt-1">
              <span
                v-if="status"
                :class="cn('status-pill', status.bg, status.text)"
              >
                <span
                  :class="cn('status-dot', status.dot, status.pulse && 'animate-pulse')"
                />
                {{ status.label }}
              </span>
            </div>
            <p v-if="file.status === 'failed'" class="mt-1.5 text-xs text-destructive">
              {{ file.errorMessage || '解析失败，请检查文件格式' }}
            </p>
          </div>
        </section>

        <Separator />

        <!-- Preview placeholder -->
        <section>
          <div class="text-xs text-muted-foreground mb-2">文档预览</div>
          <div
            class="panel flex h-72 flex-col items-center justify-center text-center gap-2 border-dashed bg-muted/30"
          >
            <FileSearch class="size-8 text-muted-foreground/60" />
            <p class="text-sm font-medium">预览即将上线</p>
            <p class="text-xs text-muted-foreground max-w-xs">
              后续将支持 Markdown / Word / Excel / TXT 的在线预览。点击下方按钮可下载原文件。
            </p>
          </div>
        </section>

        <Separator />

        <!-- Quick actions -->
        <section class="space-y-2">
          <div class="text-xs text-muted-foreground">快捷操作</div>
          <div class="grid grid-cols-3 gap-2">
            <Button variant="outline" class="h-auto py-3 flex-col gap-1.5">
              <Download class="size-4" />
              <span class="text-xs">下载</span>
            </Button>
            <Button variant="outline" class="h-auto py-3 flex-col gap-1.5">
              <ExternalLink class="size-4" />
              <span class="text-xs">打开原文件</span>
            </Button>
            <Button variant="outline" class="h-auto py-3 flex-col gap-1.5">
              <Bot class="size-4" />
              <span class="text-xs">发送到 AI 助手</span>
            </Button>
          </div>
        </section>
      </div>

      <div v-if="file" class="border-t p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          class="text-destructive hover:text-destructive hover:bg-destructive/10"
          @click="emit('delete', file!)"
        >
          <Trash2 class="size-4" />
          删除文件
        </Button>
        <Button variant="outline" @click="emit('update:open', false)">
          关闭
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>
