<script setup lang="ts">
import { computed } from 'vue'
import {
  Gauge,
  MessagesSquare,
  BookOpenCheck,
  Flame,
  Settings,
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'
import { Button } from '@/components/ui/button'
import SidebarNavItem from './SidebarNavItem.vue'
import { cn } from '@/lib/utils'

const appStore = useAppStore()
const collapsed = computed(() => appStore.sidebarCollapsed)

const navItems = [
  { to: '/dashboard', icon: Gauge, label: '运行概览', matchKey: 'dashboard' },
  { to: '/knowledge', icon: BookOpenCheck, label: '规程知识库', matchKey: 'knowledge' },
  { to: '/chat', icon: MessagesSquare, label: 'AI 运行助手', matchKey: 'chat' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: '偏好设置' },
  { to: '/help', icon: LifeBuoy, label: '帮助中心' },
]
</script>

<template>
  <aside
    :class="
      cn(
        'relative flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out',
        collapsed ? 'w-[68px]' : 'w-[240px]',
      )
    "
  >
    <!-- Brand -->
    <div
      :class="
        cn(
          'flex items-center gap-2.5 px-4 border-b border-sidebar-border',
          collapsed ? 'h-14 justify-center px-2' : 'h-14',
        )
      "
    >
      <div
        class="flex size-8 items-center justify-center rounded-lg brand-gradient text-brand-foreground shadow-sm"
      >
        <Flame class="size-4" />
      </div>
      <div v-if="!collapsed" class="flex flex-col leading-tight">
        <span class="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
          OpsBrain
        </span>
        <span class="text-[11px] text-muted-foreground">运行智脑 · AI Copilot</span>
      </div>
    </div>

    <!-- Main nav -->
    <nav class="flex-1 px-3 py-4 space-y-1 ob-scrollbar overflow-y-auto">
      <div
        v-if="!collapsed"
        class="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70"
      >
        运行菜单
      </div>
      <SidebarNavItem
        v-for="item in navItems"
        :key="item.to"
        v-bind="item"
        :collapsed="collapsed"
      />
    </nav>

    <!-- Bottom -->
    <div class="px-3 pb-3 space-y-1">
      <SidebarNavItem
        v-for="item in bottomItems"
        :key="item.to"
        v-bind="item"
        :collapsed="collapsed"
      />
      <div class="pt-2">
        <Button
          variant="ghost"
          size="icon-sm"
          class="w-full hover:bg-sidebar-accent"
          @click="appStore.toggleSidebar()"
        >
          <PanelLeftClose v-if="!collapsed" class="size-4" />
          <PanelLeftOpen v-else class="size-4" />
        </Button>
      </div>
    </div>
  </aside>
</template>
