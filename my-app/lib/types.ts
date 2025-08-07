export interface User {
  id: string
  email: string
  name?: string
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}
