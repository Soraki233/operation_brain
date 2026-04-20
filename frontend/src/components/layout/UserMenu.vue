<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { LogOut, User, Settings, Keyboard } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const initials = computed(() => {
  const n = auth.user?.nickname || auth.user?.username || 'U'
  return n.slice(0, 1).toUpperCase()
})

function handleLogout() {
  auth.logout()
  toast.success('已退出登录')
  router.push('/login')
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        class="ob-focus flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-accent cursor-pointer transition-colors"
      >
        <Avatar class="size-8">
          <AvatarImage v-if="auth.user?.avatar" :src="auth.user.avatar" />
          <AvatarFallback class="bg-brand-soft text-brand-soft-foreground text-xs font-semibold">
            {{ initials }}
          </AvatarFallback>
        </Avatar>
        <div class="hidden md:flex flex-col items-start leading-tight">
          <span class="text-sm font-medium">{{ auth.user?.nickname || '未登录' }}</span>
          <span class="text-[11px] text-muted-foreground">{{ auth.user?.orgName || '—' }}</span>
        </div>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel class="flex flex-col gap-0.5">
        <span class="text-sm font-medium">{{ auth.user?.nickname }}</span>
        <span class="text-xs text-muted-foreground">{{ auth.user?.email }}</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <User class="size-4" />
        <span>个人资料</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Settings class="size-4" />
        <span>偏好设置</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Keyboard class="size-4" />
        <span>快捷键</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="text-destructive focus:text-destructive" @click="handleLogout">
        <LogOut class="size-4" />
        <span>退出登录</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
