<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import {
  Flame,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import AuthBrandPanel from '@/views/Login/components/AuthBrandPanel.vue'
import PasswordStrength from './components/PasswordStrength.vue'
import { authApi } from '@/api'
import { cn } from '@/lib/utils'

const router = useRouter()

const schema = toTypedSchema(
  z
    .object({
      username: z
        .string()
        .min(1, '请输入用户名')
        .min(2, '用户名至少 2 位')
        .max(32, '用户名最多 32 位'),
      email: z.string().min(1, '请输入邮箱').email('邮箱格式不正确'),
      password: z
        .string()
        .min(1, '请输入密码')
        .min(8, '密码至少 8 位')
        .regex(/[a-zA-Z]/, '密码需要包含字母')
        .regex(/\d/, '密码需要包含数字'),
      confirmPassword: z.string().min(1, '请再次输入密码'),
      agreed: z.boolean().refine((v) => v === true, {
        message: '请先同意服务条款与隐私政策',
      }),
    })
    .refine((v) => v.password === v.confirmPassword, {
      path: ['confirmPassword'],
      message: '两次输入的密码不一致',
    }),
)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: schema,
  initialValues: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  },
})

const [username, usernameAttrs] = defineField('username')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')
const [agreed] = defineField('agreed')

const showPwd = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const serverError = ref<string | null>(null)

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  serverError.value = null
  try {
    await authApi.register({
      username: values.username,
      email: values.email,
      password: values.password,
    })
    toast.success('注册成功，请使用新账号登录')
    router.push('/login')
  } catch (e) {
    const msg = e instanceof Error ? e.message : '注册失败，请稍后重试'
    serverError.value = msg
    toast.error(msg)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-[1fr_1.05fr] bg-background">
    <div class="flex items-center justify-center p-6 lg:p-10 order-2 lg:order-1">
      <Card class="w-full max-w-md border-none shadow-none bg-transparent">
        <CardContent class="p-0">
          <div class="lg:hidden mb-6 flex items-center gap-2">
            <div class="flex size-9 items-center justify-center rounded-lg brand-gradient text-brand-foreground">
              <Flame class="size-5" />
            </div>
            <span class="text-lg font-semibold tracking-tight">OpsBrain</span>
          </div>

          <h1 class="text-2xl font-semibold tracking-tight">开通运行账号</h1>
          <p class="mt-1.5 text-sm text-muted-foreground">
            创建账号后即可接入厂内知识库，让 AI 助你查规程、写预案、做复盘
          </p>

          <div
            v-if="serverError"
            class="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle class="size-4 shrink-0 mt-0.5" />
            <span>{{ serverError }}</span>
          </div>

          <form class="mt-6 space-y-4" novalidate @submit="onSubmit">
            <!-- Username -->
            <div class="space-y-1.5">
              <Label for="username">用户名</Label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="username"
                  v-model="username"
                  v-bind="usernameAttrs"
                  placeholder="建议使用真实姓名，便于同事识别"
                  class="h-10 pl-9"
                  :class="cn(errors.username && 'border-destructive focus-visible:ring-destructive/40')"
                />
              </div>
              <p v-if="errors.username" class="text-xs text-destructive">{{ errors.username }}</p>
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <Label for="email">邮箱</Label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  v-model="email"
                  v-bind="emailAttrs"
                  type="email"
                  placeholder="name@wte-plant.cn"
                  class="h-10 pl-9"
                  :class="cn(errors.email && 'border-destructive focus-visible:ring-destructive/40')"
                  autocomplete="email"
                />
              </div>
              <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <Label for="password">密码</Label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  v-model="password"
                  v-bind="passwordAttrs"
                  :type="showPwd ? 'text' : 'password'"
                  placeholder="至少 8 位，包含字母和数字"
                  class="h-10 pl-9 pr-10"
                  :class="cn(errors.password && 'border-destructive focus-visible:ring-destructive/40')"
                  autocomplete="new-password"
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
              <PasswordStrength v-else :value="password ?? ''" />
            </div>

            <!-- Confirm password -->
            <div class="space-y-1.5">
              <Label for="confirm">确认密码</Label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  v-model="confirmPassword"
                  v-bind="confirmPasswordAttrs"
                  :type="showConfirm ? 'text' : 'password'"
                  placeholder="再次输入密码"
                  class="h-10 pl-9 pr-10"
                  :class="cn(errors.confirmPassword && 'border-destructive focus-visible:ring-destructive/40')"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                  tabindex="-1"
                  @click="showConfirm = !showConfirm"
                >
                  <EyeOff v-if="showConfirm" class="size-4" />
                  <Eye v-else class="size-4" />
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="text-xs text-destructive">
                {{ errors.confirmPassword }}
              </p>
            </div>

            <!-- Agreement -->
            <div>
              <label class="flex items-start gap-2 text-xs text-muted-foreground select-none cursor-pointer">
                <Checkbox v-model="agreed" class="mt-0.5" />
                <span>
                  我已阅读并同意
                  <a class="text-brand hover:underline cursor-pointer">《服务条款》</a>
                  与
                  <a class="text-brand hover:underline cursor-pointer">《隐私政策》</a>
                </span>
              </label>
              <p v-if="errors.agreed" class="mt-1 text-xs text-destructive">
                {{ errors.agreed }}
              </p>
            </div>

            <Button type="submit" class="w-full h-10" :disabled="loading">
              <Loader2 v-if="loading" class="size-4 animate-spin" />
              {{ loading ? '注册中…' : '创建账号' }}
            </Button>

            <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground justify-center">
              <ShieldCheck class="size-3 text-success" />
              账号仅用于厂内知识库访问，不会对外共享
            </div>
          </form>

          <p class="mt-6 text-center text-sm text-muted-foreground">
            已有账号？
            <RouterLink to="/login" class="text-brand font-medium hover:underline">立即登录</RouterLink>
          </p>
        </CardContent>
      </Card>
    </div>

    <div class="order-1 lg:order-2">
      <AuthBrandPanel
        title="让规程真正\n跟着值班走"
        subtitle="开通账号后，你可以把常用的处置卡、规程、案例上传上来，下一次值班就能直接问 AI 拿到带出处的答案。"
      />
    </div>
  </div>
</template>
