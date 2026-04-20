<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-background">
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppTopbar />
      <main class="relative flex-1 overflow-hidden">
        <RouterView v-slot="{ Component, route }">
          <Transition name="fade-slide" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
