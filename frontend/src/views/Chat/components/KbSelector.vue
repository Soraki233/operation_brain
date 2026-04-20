<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { BookOpenCheck, ChevronDown, Check, X, Factory, User } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { KnowledgeBaseOption } from '@/types/chat'
import { useChatStore } from '@/stores/chat'

interface Props {
  variant?: 'default' | 'inline'
}

withDefaults(defineProps<Props>(), { variant: 'default' })

const store = useChatStore()

onMounted(() => {
  void store.loadKbOptions()
})

const personalGroup = computed(() =>
  store.kbOptions.filter((o) => o.scope === 'personal'),
)
const sharedGroup = computed(() =>
  store.kbOptions.filter((o) => o.scope === 'shared'),
)

const current = computed<KnowledgeBaseOption | null>(() => {
  const sess = store.activeSession
  if (!sess?.kbId) return null
  return store.kbOptions.find((o) => o.id === sess.kbId) ?? null
})

async function pick(kb: KnowledgeBaseOption | null) {
  await store.bindKb(kb)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        v-if="variant === 'default'"
        variant="outline"
        size="sm"
        class="gap-1.5 max-w-[240px]"
      >
        <BookOpenCheck class="size-3.5 text-brand" />
        <span class="truncate">
          {{ current ? current.name : '选择知识库' }}
        </span>
        <Badge
          v-if="!current"
          variant="outline"
          class="text-[10px] text-muted-foreground border-dashed"
        >
          未绑定
        </Badge>
        <ChevronDown class="size-3.5 opacity-60" />
      </Button>
      <Button
        v-else
        variant="ghost"
        size="sm"
        class="gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <BookOpenCheck class="size-3.5" />
        <span class="max-w-[180px] truncate">
          {{ current ? current.name : '选择知识库' }}
        </span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-[260px]">
      <DropdownMenuLabel class="flex items-center gap-1.5 text-muted-foreground">
        <User class="size-3.5" /> 个人知识库
      </DropdownMenuLabel>
      <DropdownMenuItem
        v-for="kb in personalGroup"
        :key="kb.id"
        @click="pick(kb)"
      >
        <span class="flex-1 truncate">{{ kb.name }}</span>
        <Check v-if="current?.id === kb.id" class="size-3.5 text-brand" />
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel class="flex items-center gap-1.5 text-muted-foreground">
        <Factory class="size-3.5" /> 全厂知识库
      </DropdownMenuLabel>
      <DropdownMenuItem
        v-for="kb in sharedGroup"
        :key="kb.id"
        @click="pick(kb)"
      >
        <span class="flex-1 truncate">{{ kb.name }}</span>
        <Check v-if="current?.id === kb.id" class="size-3.5 text-brand" />
      </DropdownMenuItem>
      <DropdownMenuSeparator v-if="current" />
      <DropdownMenuItem
        v-if="current"
        class="text-muted-foreground"
        @click="pick(null)"
      >
        <X class="size-3.5" /> 解除绑定
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
