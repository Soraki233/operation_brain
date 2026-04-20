<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import {
  Flame,
  IdCard,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import AuthBrandPanel from './components/AuthBrandPanel.vue'
import { cn } from '@/lib/utils'

const router = useRouter()
const auth = useAuthStore()

const schema = toTypedSchema(
  z.object({
    account: z
      .string()
      .min(1, '请输入账号')
      .min(3, '账号至少 3 位')
      .max(64, '账号最多 64 位'),
    password: z
      .string()
      .min(1, '请输入密码')
      .min(6, '密码至少 6 位')
      .max(64, '密码最多 64 位'),
    remember: z.boolean(),
  }),
)

const { handleSubmit, errors, defineField, setFieldValue, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: { account: '', password: '', remember: true },
})

const [account, accountAttrs] = defineField('account')
const [password, passwordAttrs] = defineField('password')
const [remember] = defineField('remember')

const showPwd = ref(false)
const loading = ref(false)
const serverError = ref<string | null>(null)

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  serverError.value = null
  try {
    await auth.login({
      account: values.account,
      password: values.password,
      remember: values.remember,
    })
    toast.success('登录成功')
    router.push('/dashboard')
  } catch (e) {
    const msg = e instanceof Error ? e.message : '登录失败，请稍后重试'
    serverError.value = msg
    toast.error(msg)
  } finally {
    loading.value = false
  }
})

function fillDemo() {
  setFieldValue('account', 'demo')
  setFieldValue('password', 'demo1234')
}

void isSubmitting
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-background">
    <AuthBrandPanel />

    <div class="flex items-center justify-center p-6 lg:p-10">
      <Card class="w-full max-w-md border-none shadow-none bg-transparent">
        <CardContent class="p-0">
          <div class="lg:hidden mb-6 flex items-center gap-2">
            <div class="flex size-9 items-center justify-center rounded-lg brand-gradient text-brand-foreground">
              <Flame class="size-5" />
            </div>
            <span class="text-lg font-semibold tracking-tight">OpsBrain</span>
          </div>

          <h1 class="text-2xl font-semibold tracking-tight">欢迎回来，师傅</h1>
          <p class="mt-1.5 text-sm text-muted-foreground">使用厂内统一账号登录 OpsBrain 运行智脑</p>

          <div
            v-if="serverError"
            class="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle class="size-4 shrink-0 mt-0.5" />
            <span>{{ serverError }}</span>
          </div>

          <form class="mt-7 space-y-4" novalidate @submit="onSubmit">
            <!-- Account -->
            <div class="space-y-1.5">
              <Label for="account">账号</Label>
              <div class="relative">
                <IdCard class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="account"
                  v-model="account"
                  v-bind="accountAttrs"
                  placeholder="工号 / 运行账号 / 邮箱"
                  class="h-10 pl-9"
                  :class="cn(errors.account && 'border-destructive focus-visible:ring-destructive/40')"
                  autocomplete="username"
                />
              </div>
              <p v-if="errors.account" class="text-xs text-destructive">
                {{ errors.account }}
              </p>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <Label for="password">密码</Label>
                <a class="text-xs text-brand hover:underline cursor-pointer">忘记密码？</a>
              </div>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  v-model="password"
                  v-bind="passwordAttrs"
                  :type="showPwd ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="h-10 pl-9 pr-10"
                  :class="cn(errors.password && 'border-destructive focus-visible:ring-destructive/40')"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                  tabindex="-1"
                  @click="showPwd = !showPwd"
                >
                  <EyeOff v-if="showPwd" class="size-4" />
                  <Eye v-else class="size-4" />
                </button>
              </div>
              <p v-if="errors.password" class="text-xs text-destructive">
                {{ errors.password }}
              </p>
            </div>

            <!-- Remember -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 text-sm text-muted-foreground select-none cursor-pointer">
                <Checkbox v-model="remember" />
                <span>7 天内自动登录</span>
              </label>
              <button
                type="button"
                class="text-xs text-muted-foreground hover:text-brand cursor-pointer"
                @click="fillDemo"
              >
                填入演示账号
              </button>
            </div>

            <Button type="submit" class="w-full h-10" :disabled="loading">
              <Loader2 v-if="loading" class="size-4 animate-spin" />
              {{ loading ? '登录中…' : '登录' }}
            </Button>
          </form>

          <div class="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span class="h-px flex-1 bg-border" />
            <span>或使用企业 SSO（即将上线）</span>
            <span class="h-px flex-1 bg-border" />
          </div>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" class="h-9 text-xs" disabled>飞书</Button>
            <Button variant="outline" class="h-9 text-xs" disabled>企业微信</Button>
          </div>

          <p class="mt-6 text-center text-sm text-muted-foreground">
            还没有账号？
            <RouterLink to="/register" class="text-brand font-medium hover:underline">立即注册</RouterLink>
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
