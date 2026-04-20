<script setup lang="ts">
import { Eye, Trash2, MoreVertical, Download, Bot } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import type { KbFile } from '@/types/knowledge'
import { getFileMeta } from '@/utils/fileIcon'
import { formatFileSize, formatDateTime } from '@/utils/format'
import { getStatusMeta } from '../utils/statusMap'
import { cn } from '@/lib/utils'

interface Props {
  file: KbFile
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'preview', file: KbFile): void
  (e: 'delete', file: KbFile): void
}>()

function meta() {
  return getFileMeta(props.file.name)
}
function status() {
  return getStatusMeta(props.file.status)
}
</script>

<template>
  <TableRow class="group hover:bg-muted/40 transition-colors border-b last:border-b-0">
    <TableCell class="py-3">
      <div class="flex items-center gap-3 min-w-0">
        <div
          :class="cn('flex size-9 items-center justify-center rounded-lg shrink-0', meta().bg)"
        >
          <component :is="meta().icon" :class="cn('size-5', meta().color)" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <button
              class="truncate text-sm font-medium text-foreground hover:text-brand text-left cursor-pointer"
              @click="emit('preview', file)"
            >
              {{ file.name }}
            </button>
          </div>
          <div
            v-if="file.status === 'failed' && file.errorMessage"
            class="mt-0.5 text-[11px] text-destructive truncate"
          >
            {{ file.errorMessage }}
          </div>
        </div>
      </div>
    </TableCell>
    <TableCell class="text-xs text-muted-foreground">{{ meta().label }}</TableCell>
    <TableCell class="text-xs tabular-nums text-muted-foreground">
      {{ formatFileSize(file.size) }}
    </TableCell>
    <TableCell class="text-xs text-muted-foreground whitespace-nowrap">
      {{ formatDateTime(file.uploadedAt) }}
    </TableCell>
    <TableCell>
      <span :class="cn('status-pill', status().bg, status().text)">
        <span
          :class="cn('status-dot', status().dot, status().pulse && 'animate-pulse')"
        />
        {{ status().label }}
      </span>
    </TableCell>
    <TableCell class="text-right">
      <div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon-sm" @click="emit('preview', file)">
          <Eye class="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon-sm">
              <MoreVertical class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-40">
            <DropdownMenuItem @click="emit('preview', file)">
              <Eye class="size-4" /> 预览
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download class="size-4" /> 下载
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bot class="size-4" /> 发送到 AI 助手
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-destructive focus:text-destructive"
              @click="emit('delete', file)"
            >
              <Trash2 class="size-4" /> 删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableCell>
  </TableRow>
</template>
