export enum UserRole {
  Guest = 0,
  Owner = 1,
  Customer = 2,
}

export interface LoginRequest {
  login: string
  password: string
}

export interface SignUpRequest {
  login: string
  password: string
  firstName: string
  secondName: string
  thirdName?: string
  email: string
  jobTitle: string
}

export interface MeResponse {
  id: number
  login: string
  firstName: string
  secondName: string
  thirdName?: string
  email: string
  jobTitle: string
  role: UserRole
}

export interface UserView {
  id: number
  login: string
  firstName: string
  secondName: string
  thirdName?: string
  email: string
  jobTitle: string
  role: UserRole
}
