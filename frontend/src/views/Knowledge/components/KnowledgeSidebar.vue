<script setup lang="ts">
import { FolderPlus, Info } from 'lucide-vue-next'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useKnowledgeStore } from '@/stores/knowledge'
import KnowledgeTreeNode from './KnowledgeTreeNode.vue'
import type { KbNode, KbScope } from '@/types/knowledge'

const store = useKnowledgeStore()

defineEmits<{
  (e: 'create', parent: KbNode | null): void
  (e: 'rename', node: KbNode): void
  (e: 'delete', node: KbNode): void
}>()

function onTabChange(val: string | number) {
  store.setScope(val as KbScope)
}
</script>

<template>
  <aside
    class="flex h-full w-[272px] shrink-0 flex-col border-r border-border bg-sidebar/60"
  >
    <div class="p-3 border-b border-border">
      <Tabs :model-value="store.scope" @update:model-value="onTabChange">
        <TabsList class="w-full bg-muted/60">
          <TabsTrigger value="personal" class="flex-1">个人知识库</TabsTrigger>
          <TabsTrigger value="shared" class="flex-1">全厂知识库</TabsTrigger>
        </TabsList>
      </Tabs>
      <Button
        variant="outline"
        size="sm"
        class="mt-2 w-full justify-start border-dashed"
        @click="$emit('create', null)"
      >
        <FolderPlus class="size-4" />
        新建根目录
      </Button>
    </div>

    <div class="flex-1 overflow-y-auto ob-scrollbar px-2 py-2">
      <template v-if="store.treeLoading && !store.currentTree.length">
        <div class="space-y-1 p-1">
          <Skeleton v-for="i in 8" :key="i" class="h-7 rounded-md" />
        </div>
      </template>
      <template v-else-if="!store.currentTree.length">
        <div class="px-3 py-8 text-center text-xs text-muted-foreground">
          还没有目录，点击上方按钮按系统或业务域组织规程
        </div>
      </template>
      <template v-else>
        <KnowledgeTreeNode
          v-for="root in store.currentTree"
          :key="root.id"
          :node="root"
          :depth="0"
          :expanded="store.expandedIds"
          :active-id="store.currentFolderId"
          @select="(id) => store.selectFolder(id)"
          @toggle="(id) => store.toggleExpand(id)"
          @create="(n) => $emit('create', n)"
          @rename="(n) => $emit('rename', n)"
          @delete="(n) => $emit('delete', n)"
        />
      </template>
    </div>

    <Separator />
    <div class="px-3 py-2.5 flex items-start gap-2 text-[11.5px] text-muted-foreground leading-relaxed">
      <Info class="size-3.5 mt-0.5 shrink-0" />
      <span>支持 PDF / Word / Excel / 图片 / Markdown · 上传后自动解析并建立向量索引</span>
    </div>
  </aside>
</template>
