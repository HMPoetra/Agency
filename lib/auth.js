// lib/auth.js
// Session management — JWT disimpan di HttpOnly cookie
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";
const COOKIE = "cops_session";

/** Sign + set cookie */
export async function createSession(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,         // "admin" | "user"
    officer_id: user.officer_id ?? null,
  };
  const token = jwt.sign(payload, SECRET, { expiresIn: "8h" });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 jam
    path: "/",
  });

  return payload;
}

/** Verify + return session payload, atau null */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    if (!token) return null;
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

/** Hapus cookie */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

/** Guard helper: lempar jika bukan admin */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return session;
}

/** Guard helper: lempar jika tidak login */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return session;
}
