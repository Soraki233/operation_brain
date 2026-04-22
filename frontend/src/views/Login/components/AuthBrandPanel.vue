<script setup lang="ts">
import { Flame, ShieldCheck, Zap, BookOpenCheck } from 'lucide-vue-next'

interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: '让规程真正\n跟着值班走',
  subtitle:
    'OpsBrain 面向垃圾焚烧发电厂运行人员：把规程、预案、事故案例沉淀到知识库，值班时随时让 AI 查、问、复盘。',
})

const highlights = [
  { icon: ShieldCheck, text: '私有部署 · 规程与工况数据不出厂' },
  { icon: Zap, text: '检索增强 · AI 答疑带出处与页码' },
  { icon: BookOpenCheck, text: '规程全覆盖 · 焚烧炉 / 锅炉 / 汽轮机 / 烟气净化' },
]
</script>

<template>
  <div class="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden h-full min-h-screen">
    <div class="absolute inset-0 brand-gradient" />
    <div class="absolute inset-0 bg-dotgrid opacity-25" />
    <div class="absolute -top-32 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
    <div class="absolute -bottom-32 -left-24 size-80 rounded-full bg-black/10 blur-3xl" />

    <div class="relative flex items-center gap-2.5 text-brand-foreground">
      <div
        class="flex size-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur ring-1 ring-white/25"
      >
        <Flame class="size-5" />
      </div>
      <span class="text-lg font-semibold tracking-tight">OpsBrain</span>
      <span class="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-brand-foreground/90">
        v1.2
      </span>
    </div>

    <div class="relative text-brand-foreground space-y-6">
      <h2 class="text-[32px] leading-[1.2] font-semibold whitespace-pre-line tracking-tight">
        {{ title }}
      </h2>
      <p class="text-sm text-brand-foreground/85 max-w-md leading-relaxed">
        {{ subtitle }}
      </p>
      <ul class="space-y-2.5">
        <li
          v-for="(h, i) in highlights"
          :key="i"
          class="flex items-center gap-2.5 text-sm text-brand-foreground/95"
        >
          <span
            class="flex size-6 items-center justify-center rounded-md bg-white/15 backdrop-blur-sm ring-1 ring-white/20"
          >
            <component :is="h.icon" class="size-3.5" />
          </span>
          {{ h.text }}
        </li>
      </ul>
    </div>

    <div class="relative flex items-center justify-between text-xs text-brand-foreground/80">
        <span>© {{ new Date().getFullYear() }} OpsBrain · 运行智脑 · 让规程触手可及</span>
      <div class="flex items-center gap-3">
        <a class="hover:text-brand-foreground cursor-pointer">隐私</a>
        <a class="hover:text-brand-foreground cursor-pointer">条款</a>
      </div>
    </div>
  </div>
</template>
