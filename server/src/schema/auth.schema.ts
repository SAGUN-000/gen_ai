import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(40),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export type SignUpRequest = z.infer<typeof signUpSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
