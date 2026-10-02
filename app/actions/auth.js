// app/actions/auth.js
"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { getUserByUsername } from "@/lib/queries";

const LoginSchema = z.object({
  username: z.string().min(2).trim(),
  password: z.string().min(6),
});

export async function loginAction(prevState, formData) {
  const raw = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Username minimal 2 karakter, password minimal 6 karakter." };
  }

  const { username, password } = parsed.data;
  const user = await getUserByUsername(username);

  if (!user) {
    await new Promise((r) => setTimeout(r, 1500)); // Anti brute-force delay
    return { error: "Username atau password salah." };
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 1500)); // Anti brute-force delay
    return { error: "Username atau password salah." };
  }

  await createSession(user);

  // redirect berdasarkan role
  if (user.role === "admin") {
    redirect("/admin");
  } else if (user.role === "officer") {
    redirect("/absensi");
  } else {
    redirect("/profile");
  }
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
