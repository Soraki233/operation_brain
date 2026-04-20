import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/Login.vue'),
    meta: { public: true, title: '登录 · OpsBrain' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register/Register.vue'),
    meta: { public: true, title: '注册 · OpsBrain' },
  },
  {
    path: '/',
    component: () => import('@/views/Home/Home.vue'),
    redirect: { name: 'Dashboard' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/Dashboard.vue'),
        meta: { title: '工作台 · OpsBrain', nav: 'dashboard' },
      },
      {
        path: 'chat/:sessionId?',
        name: 'Chat',
        component: () => import('@/views/Chat/Chat.vue'),
        meta: { title: 'AI 对话 · OpsBrain', nav: 'chat' },
      },
      {
        path: 'knowledge/:folderId?',
        name: 'Knowledge',
        component: () => import('@/views/Knowledge/Knowledge.vue'),
        meta: { title: '知识库 · OpsBrain', nav: 'knowledge' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Dashboard' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, saved) {
    return saved ?? { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) {
    // In dev with mock, auto-login as demo user so routes are reachable
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      auth.setAuth({
        token: 'mock-token',
        user: {
          id: 'u-1',
          username: 'demo',
          nickname: '郭梓玄',
          email: 'demo@opsbrain.ai',
          role: 'admin',
          orgName: 'OpsBrain Inc.',
          avatar: '',
        },
      })
      return true
    }
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.meta.public && auth.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    return { name: 'Dashboard' }
  }
  return true
})

router.afterEach((to) => {
  if (typeof to.meta.title === 'string') document.title = to.meta.title
})

export default router
