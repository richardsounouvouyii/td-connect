import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .email('Adresse e-mail invalide.')
    .transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
