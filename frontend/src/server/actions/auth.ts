"use client";

import { SignupFormSchema, type FormState } from "#/lib/definitions/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function signup(state: FormState, formData: FormData) {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phoneNumber: formData.get("phoneNumber"),
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Prepare data for insertion into database
  const { firstName, lastName, phoneNumber, email, username, password } = validatedFields.data;
  
  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return {
      errors: {
        email: ["An account with this email already exists."],
      },
    };
  }

  const existingUsername = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (existingUsername) {
    return {
      errors: {
        username: ["This username is already taken."],
      },
    };
  }

  // Hash the user's password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert the user into the database
  const data = await db
    .insert(users)
    .values({
      firstName,
      lastName,
      phoneNumber,
      email,
      username,
      password: hashedPassword,
    })
    .returning({ id: users.id });

  const user = data[0];

  if (!user) {
    return {
      message: "An error occurred while creating your account.",
    };
  }

  // 4. Create user session
  // TODO: Implement session creation logic here
  // This could involve creating a session token, setting cookies, etc.

  // 5. Redirect user
  redirect("/dashboard");
}
