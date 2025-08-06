import { z } from "zod";

export const SignupFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters long." })
    .trim(),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters long." })
    .trim(),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .regex(/^\+?[0-9]+$/, { message: "Please enter a valid phone number." })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(20, { message: "Username must be less than 20 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    })
    .trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
});

export type FormState =
  | {
      errors?: {
        firstName?: string[];
        lastName?: string[];
        phoneNumber?: string[];
        email?: string[];
        username?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;



export interface SessionPayload {
  userId: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}