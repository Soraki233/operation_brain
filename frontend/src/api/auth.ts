import { request } from '@/utils/request'
import type { LoginPayload, LoginResult, RegisterPayload, UserProfile } from '@/types/user'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

async function mockLogin(payload: LoginPayload): Promise<LoginResult> {
  await new Promise((r) => setTimeout(r, 500))
  return {
    token: 'mock-token-' + Date.now(),
    user: {
      id: 'u-1',
      username: payload.account,
      nickname: payload.account || '李建国',
      email: `${payload.account}@wte-plant.cn`,
      role: 'admin',
      orgName: '清源垃圾焚烧发电厂 · 运行部',
    },
  }
}

async function mockRegister(_payload: RegisterPayload): Promise<void> {
  await new Promise((r) => setTimeout(r, 600))
}

async function mockMe(): Promise<UserProfile> {
  return {
    id: 'u-1',
    username: 'demo',
    nickname: '李建国',
    email: 'lijianguo@wte-plant.cn',
    role: 'admin',
    orgName: '清源垃圾焚烧发电厂 · 运行部',
  }
}

export const login = USE_MOCK
  ? mockLogin
  : (payload: LoginPayload) => request.post<LoginResult>('/auth/login', payload)

export const register = USE_MOCK
  ? mockRegister
  : (payload: RegisterPayload) => request.post<void>('/auth/register', payload)

export const me = USE_MOCK ? mockMe : () => request.get<UserProfile>('/auth/me')

export const logout = USE_MOCK
  ? async () => undefined
  : () => request.post<void>('/auth/logout')
