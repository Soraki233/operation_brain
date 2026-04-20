<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  BookOpenCheck,
  MessagesSquare,
  Upload,
  Flame,
  FileText,
  MessageSquare,
  Lightbulb,
  Megaphone,
  Activity,
  BookMarked,
  CheckCircle2,
  HardHat,
  ShieldAlert,
  X,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardApi } from '@/api'
import type { DashboardBundle } from '@/api/dashboard'
import { formatRelativeTime } from '@/utils/format'
import { getFileMeta } from '@/utils/fileIcon'
import { useAuthStore } from '@/stores/auth'
import StatCard from './components/StatCard.vue'
import OnboardingChecklist from './components/OnboardingChecklist.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)
const data = ref<DashboardBundle | null>(null)
const announcementDismissed = ref(false)

onMounted(async () => {
  try {
    data.value = await dashboardApi.getDashboard()
  } finally {
    loading.value = false
  }
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const statIcons = {
  docs: BookMarked,
  queries: MessageSquare,
  drills: ShieldAlert,
  operators: HardHat,
} as const

const quickActions = [
  {
    icon: BookOpenCheck,
    title: '查阅运行规程',
    desc: '焚烧炉 / 锅炉 / 汽轮机 / 烟气净化',
    to: '/knowledge',
    accent: 'bg-brand-soft text-brand',
  },
  {
    icon: MessagesSquare,
    title: '问 AI 运行助手',
    desc: '故障处置 / 指标判读 / 应急预案',
    to: '/chat',
    accent: 'bg-info-soft text-info',
  },
  {
    icon: Upload,
    title: '上传新资料',
    desc: '处置卡 / 操作票 / 复盘报告',
    to: '/knowledge',
    accent: 'bg-success-soft text-success',
  },
] as const

const firstAnnouncement = computed(() => data.value?.announcements?.[0])
</script>

<template>
  <div class="h-full overflow-y-auto ob-scrollbar">
    <div class="mx-auto max-w-[1320px] p-6 lg:p-8 space-y-6">
      <!-- ==================== Welcome ==================== -->
      <section
        class="panel relative overflow-hidden p-6 lg:p-8 border-brand/20"
      >
        <div class="absolute inset-0 bg-dotgrid opacity-40 pointer-events-none" />
        <div class="absolute -top-24 -right-24 size-80 rounded-full brand-gradient opacity-20 blur-3xl pointer-events-none" />
        <div class="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2 text-xs font-medium text-brand">
              <Flame class="size-3.5" />
              <span>OpsBrain · 运行智脑</span>
              <span class="text-muted-foreground/70">运行 Copilot · v1.2</span>
            </div>
            <h1 class="mt-2 text-2xl lg:text-[28px] font-semibold tracking-tight">
              {{ greeting }}，{{ auth.user?.nickname || '师傅' }}
            </h1>
            <p class="mt-1.5 text-sm text-muted-foreground max-w-xl">
              这里是运行值班人员的工作台：规程、预案、处置卡一键查阅，交接班与故障处置都让 AI 帮你搭把手。
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <Button variant="outline" @click="router.push('/knowledge')">
              <BookOpenCheck class="size-4" />
              查规程
            </Button>
            <Button class="brand-gradient text-brand-foreground" @click="router.push('/chat')">
              <MessagesSquare class="size-4" />
              问 AI
            </Button>
          </div>
        </div>
      </section>

      <!-- ==================== Announcement ==================== -->
      <section
        v-if="firstAnnouncement && !announcementDismissed"
        class="relative flex items-start gap-3 rounded-xl border border-brand/30 bg-gradient-to-r from-brand-soft/60 via-brand-soft/30 to-transparent px-4 py-3"
      >
        <div
          class="size-9 shrink-0 rounded-lg bg-brand text-brand-foreground flex items-center justify-center"
        >
          <Megaphone class="size-4" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{{ firstAnnouncement.title }}</span>
            <Badge
              v-if="firstAnnouncement.badge === 'new'"
              class="h-5 bg-brand text-brand-foreground hover:bg-brand"
            >NEW</Badge>
          </div>
          <p class="mt-0.5 text-xs text-muted-foreground">
            {{ firstAnnouncement.description }}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          class="text-muted-foreground"
          @click="announcementDismissed = true"
        >
          <X class="size-3.5" />
        </Button>
      </section>

      <!-- ==================== Stats ==================== -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <template v-if="loading">
          <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-xl shimmer" />
        </template>
        <template v-else>
          <StatCard v-for="s in data?.stats" :key="s.key" :stat="s">
            <template #icon>
              <component
                :is="statIcons[s.key as keyof typeof statIcons] || BookMarked"
                class="size-3.5 text-muted-foreground"
              />
            </template>
          </StatCard>
        </template>
      </section>

      <!-- ==================== Quick actions ==================== -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          v-for="q in quickActions"
          :key="q.title"
          class="group panel p-5 card-hover text-left cursor-pointer"
          @click="router.push(q.to)"
        >
          <div class="flex items-start gap-4">
            <div
              :class="[
                'flex size-10 items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-110',
                q.accent,
              ]"
            >
              <component :is="q.icon" class="size-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="font-medium text-[15px]">{{ q.title }}</h3>
                <ArrowRight
                  class="size-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                />
              </div>
              <p class="mt-1 text-[13px] text-muted-foreground leading-relaxed">
                {{ q.desc }}
              </p>
            </div>
          </div>
        </button>
      </section>

      <!-- ==================== Main grid ==================== -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Recent files -->
        <div class="panel lg:col-span-2 p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <FileText class="size-4 text-muted-foreground" />
              <h3 class="text-sm font-semibold">最近查阅规程</h3>
            </div>
            <Button variant="ghost" size="sm" class="text-xs text-muted-foreground" @click="router.push('/knowledge')">
              查看全部 <ArrowRight class="size-3.5" />
            </Button>
          </div>

          <div class="mt-3 divide-y divide-border">
            <template v-if="loading">
              <div v-for="i in 4" :key="i" class="flex items-center gap-3 py-3">
                <Skeleton class="size-9 rounded-lg shimmer" />
                <div class="flex-1 space-y-1.5">
                  <Skeleton class="h-3.5 w-48 shimmer" />
                  <Skeleton class="h-3 w-32 shimmer" />
                </div>
              </div>
            </template>
            <template v-else>
              <div
                v-for="f in data?.recentFiles"
                :key="f.id"
                class="group flex items-center gap-3 py-3 first:pt-0 last:pb-0 cursor-pointer rounded-md hover:bg-muted/40 px-2 -mx-2 transition-colors"
              >
                <div
                  :class="[
                    'flex size-10 items-center justify-center rounded-lg',
                    getFileMeta(f.name).bg,
                  ]"
                >
                  <component
                    :is="getFileMeta(f.name).icon"
                    :class="['size-5', getFileMeta(f.name).color]"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="truncate text-sm font-medium">{{ f.name }}</span>
                    <Badge variant="secondary" class="text-[10px] h-5 shrink-0">
                      {{ getFileMeta(f.name).label }}
                    </Badge>
                  </div>
                  <div class="text-xs text-muted-foreground mt-0.5 truncate">
                    {{ f.kbName }} · {{ formatRelativeTime(f.uploadedAt) }}
                  </div>
                </div>
                <ArrowRight
                  class="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                />
              </div>
            </template>
          </div>
        </div>

        <!-- Onboarding -->
        <div v-if="loading">
          <Skeleton class="h-80 w-full rounded-xl shimmer" />
        </div>
        <OnboardingChecklist
          v-else-if="data?.onboarding?.length"
          :items="data.onboarding"
        />
      </section>

      <!-- ==================== Second grid ==================== -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Activity timeline -->
        <div class="panel p-5 lg:col-span-2">
          <div class="flex items-center gap-2">
            <Activity class="size-4 text-muted-foreground" />
            <h3 class="text-sm font-semibold">最近动态</h3>
            <Badge variant="outline" class="ml-auto text-[10px] text-muted-foreground">
              近 7 天
            </Badge>
          </div>
          <div class="mt-4">
            <template v-if="loading">
              <div v-for="i in 4" :key="i" class="flex gap-3 pb-5 last:pb-0">
                <Skeleton class="size-9 rounded-full shimmer shrink-0" />
                <div class="flex-1 space-y-2">
                  <Skeleton class="h-3.5 w-60 shimmer" />
                  <Skeleton class="h-3 w-32 shimmer" />
                </div>
              </div>
            </template>
            <ActivityTimeline
              v-else-if="data?.activities?.length"
              :activities="data.activities"
            />
          </div>
        </div>

        <!-- Recent sessions + tip -->
        <div class="panel p-5 flex flex-col">
          <div class="flex items-center gap-2 mb-3">
            <MessageSquare class="size-4 text-muted-foreground" />
            <h3 class="text-sm font-semibold">最近问答</h3>
            <Button variant="ghost" size="sm" class="ml-auto text-xs text-muted-foreground" @click="router.push('/chat')">
              更多 <ArrowRight class="size-3.5" />
            </Button>
          </div>
          <div class="flex-1 space-y-2">
            <template v-if="loading">
              <Skeleton v-for="i in 3" :key="i" class="h-[58px] rounded-lg shimmer" />
            </template>
            <template v-else>
              <div
                v-for="s in data?.recentSessions?.slice(0, 3)"
                :key="s.id"
                class="group cursor-pointer rounded-lg border border-transparent bg-muted/30 px-3 py-2.5 hover:border-brand/30 hover:bg-brand-soft/40 transition-colors"
                @click="router.push('/chat')"
              >
                <div class="flex items-center gap-1.5">
                  <CheckCircle2 class="size-3 text-brand shrink-0" />
                  <span class="text-sm font-medium truncate">{{ s.title }}</span>
                </div>
                <div class="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span class="truncate">{{ s.kbName || '未绑定知识库' }}</span>
                  <span class="shrink-0 tabular-nums">{{ formatRelativeTime(s.updatedAt) }}</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Tip -->
          <div
            v-if="(data?.tips?.length || 0) > 0 && !loading"
            class="mt-4 rounded-lg border border-dashed border-brand/30 bg-brand-soft/30 p-3"
          >
            <div class="flex items-start gap-2">
              <Lightbulb class="size-4 text-brand mt-0.5 shrink-0" />
              <p class="text-[12.5px] leading-relaxed text-brand-soft-foreground">
                {{ data?.tips[0] }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
