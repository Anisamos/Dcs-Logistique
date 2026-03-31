import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.email, email));
    if (!user[0]) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user[0].passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    await createSession(user[0].id);

    return NextResponse.json({
      user: { id: user[0].id, name: user[0].name, email: user[0].email, role: user[0].role },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
