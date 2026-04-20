<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import type { Component } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  to: string
  icon: Component
  label: string
  collapsed?: boolean
  matchKey?: string
}

const props = defineProps<Props>()

const route = useRoute()
const isActive = computed(() => {
  if (props.matchKey && route.meta.nav === props.matchKey) return true
  return route.path === props.to || route.path.startsWith(props.to + '/')
})
</script>

<template>
  <RouterLink
    :to="to"
    :class="
      cn(
        'group relative flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ob-focus cursor-pointer',
        collapsed ? 'h-10 w-10 justify-center' : 'h-10 w-full',
        isActive
          ? 'bg-brand-soft text-brand-soft-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )
    "
  >
    <span
      v-if="isActive"
      class="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-brand"
    />
    <component :is="icon" :class="cn('size-[18px] shrink-0', isActive ? 'text-brand' : '')" />
    <span v-if="!collapsed" class="truncate">{{ label }}</span>
  </RouterLink>
</template>
