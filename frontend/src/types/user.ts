export interface UserProfile {
  id: string
  username: string
  nickname: string
  email: string
  avatar?: string
  role: 'admin' | 'member' | 'viewer'
  orgName?: string
}

export interface LoginPayload {
  phone: string
  password: string
  remember?: boolean
}

export interface RegisterPayload {
  username: string
  phone: string
  verificationCode: string
  password: string
  confirmPassword?: string
}

export interface LoginResult {
  token: string
  user: UserProfile
}
