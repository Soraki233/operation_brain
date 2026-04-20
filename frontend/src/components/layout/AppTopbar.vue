<script setup lang="ts">
import { Bell, Search, Sun, Moon, Plus } from 'lucide-vue-next'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import UserMenu from './UserMenu.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const isDark = computed(() => appStore.theme === 'dark')

function toggleTheme() {
  appStore.setTheme(isDark.value ? 'light' : 'dark')
}
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-5 backdrop-blur-md"
  >
    <!-- Global search -->
    <div class="relative w-full max-w-md">
      <Search class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        placeholder="搜索规程、预案、处置卡…"
        class="h-9 pl-9 pr-14 bg-muted/60 border-transparent focus-visible:bg-card focus-visible:border-border"
      />
      <kbd
        class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
      >
        ⌘ K
      </kbd>
    </div>

    <div class="ml-auto flex items-center gap-1.5">
      <Button variant="default" size="sm" class="hidden md:inline-flex">
        <Plus class="size-4" />
        <span>新建问答</span>
      </Button>
      <Separator orientation="vertical" class="mx-1 !h-6 hidden md:block" />
      <Button variant="ghost" size="icon" class="relative" aria-label="通知">
        <Bell class="size-[18px]" />
        <Badge
          class="absolute right-1.5 top-1.5 h-4 min-w-4 justify-center rounded-full bg-brand px-1 text-[10px] text-brand-foreground"
        >
          3
        </Badge>
      </Button>
      <Button variant="ghost" size="icon" aria-label="切换主题" @click="toggleTheme">
        <Sun v-if="isDark" class="size-[18px]" />
        <Moon v-else class="size-[18px]" />
      </Button>
      <Separator orientation="vertical" class="mx-1 !h-6" />
      <UserMenu />
    </div>
  </header>
</template>
