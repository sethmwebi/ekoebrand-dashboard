import { z } from "zod";

// Zod schema for validation
export const SignInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Type for form data
export type SigninFormData = z.infer<typeof SignInSchema>;
