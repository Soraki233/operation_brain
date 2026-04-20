<script setup lang="ts">
import { MoreHorizontal, Pin, PinOff, Pencil, Trash2, Library } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ChatSession } from '@/types/chat'
import { formatRelativeTime } from '@/utils/format'
import { cn } from '@/lib/utils'

interface Props {
  session: ChatSession
  active: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'rename', s: ChatSession): void
  (e: 'pin', s: ChatSession): void
  (e: 'delete', s: ChatSession): void
}>()

void props
</script>

<template>
  <div
    :class="
      cn(
        'group relative rounded-lg border px-3 py-2.5 cursor-pointer transition-all',
        active
          ? 'bg-brand-soft/70 border-brand/40 shadow-sm'
          : 'border-transparent hover:bg-muted/70 hover:border-border',
      )
    "
    @click="emit('select', session.id)"
  >
    <div class="flex items-center gap-1.5">
      <Pin v-if="session.pinned" class="size-3 text-brand shrink-0" />
      <span class="truncate text-sm font-medium">{{ session.title }}</span>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="ml-auto p-1 rounded opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 hover:bg-background text-muted-foreground cursor-pointer transition-opacity"
            @click.stop
          >
            <MoreHorizontal class="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-40">
          <DropdownMenuItem @click="emit('rename', session)">
            <Pencil class="size-4" /> 重命名
          </DropdownMenuItem>
          <DropdownMenuItem @click="emit('pin', session)">
            <PinOff v-if="session.pinned" class="size-4" />
            <Pin v-else class="size-4" />
            {{ session.pinned ? '取消置顶' : '置顶' }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="text-destructive focus:text-destructive"
            @click="emit('delete', session)"
          >
            <Trash2 class="size-4" /> 删除该问答
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="mt-1 text-[11.5px] text-muted-foreground truncate">
      {{ session.lastMessage || '暂无消息' }}
    </div>
    <div class="mt-1 flex items-center justify-between text-[10.5px] text-muted-foreground/80">
      <span class="flex items-center gap-1 truncate">
        <Library v-if="session.kbName" class="size-3 shrink-0" />
        <span class="truncate">{{ session.kbName || '未绑定知识库' }}</span>
      </span>
      <span class="shrink-0 ml-2 tabular-nums">{{ formatRelativeTime(session.updatedAt) }}</span>
    </div>
  </div>
</template>
