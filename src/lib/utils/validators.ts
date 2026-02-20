import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const contentProjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  niche: z.string().min(1, "El nicho es requerido").max(100),
  description: z.string().max(500).optional(),
  config: z.object({
    tone: z.enum([
      "educational",
      "entertainment",
      "inspirational",
      "controversial",
      "storytelling",
    ]),
    targetAudience: z.string().min(1).max(200),
    language: z.string().default("es"),
    contentPillars: z.array(z.string()).min(1).max(10),
    brandVoice: z.string().max(500).optional(),
    avoidTopics: z.array(z.string()).max(20).optional(),
  }),
  socialAccountIds: z.array(z.string()).min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ContentProjectInput = z.infer<typeof contentProjectSchema>;
