<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import KnowledgeFileRow from './KnowledgeFileRow.vue'
import KnowledgeEmpty from './KnowledgeEmpty.vue'
import type { KbFile } from '@/types/knowledge'

interface Props {
  items: KbFile[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  error: string | null
  keyword: string
  hasFolder: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'preview', file: KbFile): void
  (e: 'delete', file: KbFile): void
  (e: 'upload'): void
  (e: 'retry'): void
  (e: 'pageChange', page: number): void
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const start = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const end = computed(() => Math.min(props.page * props.pageSize, props.total))

const showEmpty = computed(
  () => !props.loading && !props.error && props.hasFolder && props.items.length === 0,
)
const showNoFolder = computed(() => !props.loading && !props.error && !props.hasFolder)
</script>

<template>
  <div class="flex flex-1 flex-col overflow-hidden">
    <div class="px-6 pt-4 pb-6 flex flex-1 flex-col min-h-0">
      <div class="panel flex-1 flex flex-col min-h-0 overflow-hidden">
        <!-- Error -->
        <div
          v-if="error"
          class="flex flex-1 flex-col items-center justify-center p-10 text-center"
        >
          <div class="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle class="size-5" />
          </div>
          <p class="mt-3 text-sm font-medium">加载失败</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ error }}</p>
          <Button class="mt-4" variant="outline" size="sm" @click="emit('retry')">
            重试
          </Button>
        </div>

        <!-- No folder selected -->
        <KnowledgeEmpty
          v-else-if="showNoFolder"
          title="请选择一个目录"
          desc="从左侧树中选择目录，或新建一个目录开始。"
          :can-upload="false"
        />

        <!-- Empty (folder selected but no files) -->
        <KnowledgeEmpty
          v-else-if="showEmpty && !keyword"
          @upload="emit('upload')"
        />

        <!-- Search empty -->
        <div
          v-else-if="showEmpty && keyword"
          class="flex flex-1 flex-col items-center justify-center p-10 text-center text-sm text-muted-foreground"
        >
          没有匹配“{{ keyword }}”的文件
        </div>

        <!-- Table (loading or with data) -->
        <div
          v-else
          class="flex flex-1 flex-col min-h-0"
        >
          <div class="overflow-auto ob-scrollbar flex-1">
            <Table>
              <TableHeader class="sticky top-0 bg-card/95 backdrop-blur z-10">
                <TableRow class="hover:bg-transparent">
                  <TableHead class="w-[40%]">文件名</TableHead>
                  <TableHead class="w-[90px]">类型</TableHead>
                  <TableHead class="w-[100px]">大小</TableHead>
                  <TableHead class="w-[180px]">上传时间</TableHead>
                  <TableHead class="w-[110px]">状态</TableHead>
                  <TableHead class="w-[110px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="loading && items.length === 0">
                  <TableRow v-for="i in 6" :key="i" class="hover:bg-transparent">
                    <TableCell class="py-3">
                      <div class="flex items-center gap-3">
                        <Skeleton class="size-9 rounded-lg" />
                        <div class="space-y-1.5">
                          <Skeleton class="h-3.5 w-48" />
                          <Skeleton class="h-3 w-28" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton class="h-3 w-10" /></TableCell>
                    <TableCell><Skeleton class="h-3 w-12" /></TableCell>
                    <TableCell><Skeleton class="h-3 w-32" /></TableCell>
                    <TableCell><Skeleton class="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton class="h-6 w-16 ml-auto" /></TableCell>
                  </TableRow>
                </template>
                <template v-else>
                  <KnowledgeFileRow
                    v-for="file in items"
                    :key="file.id"
                    :file="file"
                    @preview="(f) => emit('preview', f)"
                    @delete="(f) => emit('delete', f)"
                  />
                </template>
              </TableBody>
            </Table>
          </div>

          <!-- Pagination -->
          <div
            v-if="total > 0"
            class="flex items-center justify-between border-t px-4 py-2.5 text-xs text-muted-foreground bg-card"
          >
            <div>
              共 <span class="text-foreground font-medium">{{ total }}</span> 个文件，显示
              {{ start }} - {{ end }}
            </div>
            <div class="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                :disabled="page <= 1"
                @click="emit('pageChange', page - 1)"
              >
                <ChevronLeft class="size-4" />
              </Button>
              <span class="px-2 tabular-nums">{{ page }} / {{ totalPages }}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                :disabled="page >= totalPages"
                @click="emit('pageChange', page + 1)"
              >
                <ChevronRight class="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
