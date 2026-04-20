<script setup lang="ts">
import { computed } from 'vue'
import { Search, Upload, FolderPlus, RotateCw, Home } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useKnowledgeStore } from '@/stores/knowledge'

interface Props {
  keyword: string
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:keyword', v: string): void
  (e: 'upload'): void
  (e: 'newFolder'): void
  (e: 'refresh'): void
}>()

const store = useKnowledgeStore()
const trail = computed(() => store.breadcrumb())
</script>

<template>
  <div class="flex flex-col gap-3 border-b border-border bg-background/60 px-6 py-4">
    <!-- Row 1: breadcrumbs + right actions -->
    <div class="flex items-center gap-3">
      <Breadcrumb class="min-w-0 flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink class="flex items-center gap-1 cursor-pointer">
              <Home class="size-3.5" />
              <span>{{ store.scope === 'personal' ? '个人知识库' : '全厂知识库' }}</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <template v-for="(n, i) in trail" :key="n.id">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage v-if="i === trail.length - 1" class="font-medium">
                {{ n.name }}
              </BreadcrumbPage>
              <BreadcrumbLink
                v-else
                class="cursor-pointer"
                @click="store.selectFolder(n.id)"
              >
                {{ n.name }}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </template>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="ghost" size="icon-sm" @click="emit('refresh')">
        <RotateCw class="size-4" />
      </Button>
      <Button variant="outline" size="sm" @click="emit('newFolder')">
        <FolderPlus class="size-4" />
        新建文件夹
      </Button>
      <Button size="sm" class="shadow-sm" @click="emit('upload')">
        <Upload class="size-4" />
        上传文件
      </Button>
    </div>

    <!-- Row 2: title + search -->
    <div class="flex items-center gap-3">
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-semibold tracking-tight truncate">
          {{ store.currentNode?.name || '请选择一个目录' }}
        </h1>
        <p class="mt-0.5 text-xs text-muted-foreground">
          上传规程 / 处置卡后，AI 运行助手即可在此目录下作答
        </p>
      </div>
      <div class="relative w-[260px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          :model-value="keyword"
          placeholder="搜索当前目录下的规程 / 预案"
          class="h-9 pl-9"
          @update:model-value="(v) => emit('update:keyword', String(v))"
        />
      </div>
    </div>
  </div>
</template>
