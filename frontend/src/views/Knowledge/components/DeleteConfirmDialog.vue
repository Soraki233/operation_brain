<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Props {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '确认删除？',
  description: '删除后不可恢复，请谨慎操作。',
  confirmText: '删除',
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <AlertDialog :open="open" @update:open="(v) => emit('update:open', v)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <div class="flex items-start gap-3">
          <div
            class="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0"
          >
            <AlertTriangle class="size-5" />
          </div>
          <div class="flex-1">
            <AlertDialogTitle>{{ title }}</AlertDialogTitle>
            <AlertDialogDescription class="mt-1.5">
              {{ description }}
            </AlertDialogDescription>
          </div>
        </div>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="loading">取消</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-white hover:bg-destructive/90"
          :disabled="loading"
          @click="emit('confirm')"
        >
          {{ loading ? '处理中…' : confirmText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
