export const ROLES = [
  'STUDENT',
  'TRAINER',
  'SCHOOL_ADMIN',
  'SUPER_ADMIN',
] as const

export type Role = (typeof ROLES)[number]
