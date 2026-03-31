import { createHash } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE_NAME = "adc_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return hashPassword(password) === hash;
}

export async function createSession(userId: number): Promise<string> {
  const token = createHash("sha256")
    .update(`${userId}-${Date.now()}-${Math.random()}`)
    .digest("hex");

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, `${userId}:${token}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return token;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (!session) return null;

  const [userIdStr] = session.value.split(":");
  const userId = parseInt(userIdStr, 10);

  if (isNaN(userId)) return null;

  const user = await db.select().from(users).where(eq(users.id, userId));
  return user[0] || null;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
