<script setup lang="ts">
import { computed } from 'vue'
import {
  ChevronRight,
  Folder,
  FolderOpen,
  Library,
  MoreHorizontal,
  FolderPlus,
  Pencil,
  Trash2,
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { KbNode } from '@/types/knowledge'

interface Props {
  node: KbNode
  depth: number
  expanded: Set<string>
  activeId: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'toggle', id: string): void
  (e: 'create', parent: KbNode): void
  (e: 'rename', node: KbNode): void
  (e: 'delete', node: KbNode): void
}>()

const hasChildren = computed(() => !!props.node.children && props.node.children.length > 0)
const isOpen = computed(() => props.expanded.has(props.node.id))
const isActive = computed(() => props.activeId === props.node.id)
const isLibrary = computed(() => props.node.type === 'library')
</script>

<template>
  <div>
    <div
      :class="
        cn(
          'group relative flex items-center h-8 rounded-md pr-1 text-sm cursor-pointer transition-colors ob-focus',
          isActive
            ? 'bg-brand-soft text-brand-soft-foreground'
            : 'hover:bg-sidebar-accent text-sidebar-foreground/90',
        )
      "
      :style="{ paddingLeft: `${depth * 12 + 6}px` }"
      tabindex="0"
      @click="emit('select', node.id)"
      @keydown.enter.prevent="emit('select', node.id)"
    >
      <span
        v-if="isActive"
        class="absolute left-0 top-1 bottom-1 w-[2px] rounded-r-full bg-brand"
      />

      <button
        class="flex size-5 items-center justify-center shrink-0 text-muted-foreground hover:text-foreground cursor-pointer rounded"
        :class="!hasChildren && 'invisible'"
        @click.stop="emit('toggle', node.id)"
      >
        <ChevronRight
          :class="cn('size-3.5 transition-transform', isOpen && 'rotate-90')"
        />
      </button>

      <component
        :is="isLibrary ? Library : isOpen && hasChildren ? FolderOpen : Folder"
        :class="
          cn(
            'size-4 shrink-0 mr-1.5',
            isActive ? 'text-brand' : isLibrary ? 'text-brand' : 'text-muted-foreground',
          )
        "
      />

      <span class="truncate flex-1">{{ node.name }}</span>

      <span
        v-if="typeof node.fileCount === 'number'"
        class="ml-1 text-[11px] text-muted-foreground/80 tabular-nums"
      >
        {{ node.fileCount }}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            class="ml-0.5 flex size-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 hover:bg-background/60 text-muted-foreground cursor-pointer transition-opacity"
            @click.stop
          >
            <MoreHorizontal class="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-40">
          <DropdownMenuItem @click="emit('create', node)">
            <FolderPlus class="size-4" /> <span>新建子文件夹</span>
          </DropdownMenuItem>
          <DropdownMenuItem v-if="!isLibrary" @click="emit('rename', node)">
            <Pencil class="size-4" /> <span>重命名</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator v-if="!isLibrary" />
          <DropdownMenuItem
            v-if="!isLibrary"
            class="text-destructive focus:text-destructive"
            @click="emit('delete', node)"
          >
            <Trash2 class="size-4" /> <span>删除</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div v-if="hasChildren && isOpen">
      <KnowledgeTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :expanded="expanded"
        :active-id="activeId"
        @select="(id) => emit('select', id)"
        @toggle="(id) => emit('toggle', id)"
        @create="(n) => emit('create', n)"
        @rename="(n) => emit('rename', n)"
        @delete="(n) => emit('delete', n)"
      />
    </div>
  </div>
</template>
