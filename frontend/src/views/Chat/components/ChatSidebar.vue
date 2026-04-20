<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Search, MessageSquarePlus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import SessionItem from './SessionItem.vue'
import { useChatStore } from '@/stores/chat'
import type { ChatSession } from '@/types/chat'

const store = useChatStore()

const keyword = ref('')

const emit = defineEmits<{
  (e: 'new'): void
  (e: 'rename', s: ChatSession): void
  (e: 'delete', s: ChatSession): void
}>()

const filteredGroups = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return store.groupedSessions
  return store.groupedSessions
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (s) =>
          s.title.toLowerCase().includes(k) ||
          (s.lastMessage || '').toLowerCase().includes(k),
      ),
    }))
    .filter((g) => g.items.length)
})

async function pin(s: ChatSession) {
  await store.togglePin(s.id)
}

function selectSession(id: string) {
  void store.selectSession(id)
}

const isEmpty = computed(
  () => !store.sessionsLoading && store.sessions.length === 0,
)
const isSearchEmpty = computed(
  () =>
    !store.sessionsLoading &&
    store.sessions.length > 0 &&
    filteredGroups.value.length === 0,
)
</script>

<template>
  <aside class="flex h-full w-[300px] flex-col border-r bg-card/30">
    <!-- Header -->
    <div class="px-3 pt-3 pb-2 space-y-2">
      <Button class="w-full gap-2" @click="emit('new')">
        <Plus class="size-4" />
        新建问答
      </Button>
      <div class="relative">
        <Search
          class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
        />
        <Input
          v-model="keyword"
          placeholder="搜索问答记录"
          class="h-9 pl-8 bg-background"
        />
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto ob-scrollbar px-3 pb-3 space-y-4">
      <template v-if="store.sessionsLoading">
        <div class="space-y-2 pt-2">
          <Skeleton v-for="i in 5" :key="i" class="h-16 w-full rounded-lg" />
        </div>
      </template>

      <template v-else-if="isEmpty">
        <div class="pt-14 flex flex-col items-center text-center text-muted-foreground">
          <div class="size-12 rounded-2xl bg-brand-soft text-brand-soft-foreground flex items-center justify-center mb-3">
            <MessageSquarePlus class="size-5" />
          </div>
          <div class="text-sm font-medium text-foreground">还没有问答记录</div>
          <p class="mt-1 text-xs px-6">
            新建一个问答后，AI 会结合知识库给出带引用的回答
          </p>
        </div>
      </template>

      <template v-else-if="isSearchEmpty">
        <div class="pt-10 text-center text-xs text-muted-foreground">
          没有匹配的问答记录
        </div>
      </template>

      <template v-else>
        <div v-for="g in filteredGroups" :key="g.key">
          <div class="px-1 pb-1 text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wider">
            {{ g.label }}
          </div>
          <div class="space-y-1">
            <SessionItem
              v-for="s in g.items"
              :key="s.id"
              :session="s"
              :active="s.id === store.activeId"
              @select="selectSession"
              @rename="emit('rename', $event)"
              @pin="pin"
              @delete="emit('delete', $event)"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <div class="border-t px-3 py-2 text-[11px] text-muted-foreground">
      共 {{ store.sessions.length }} 组问答
    </div>
  </aside>
</template>
