import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createHash } from "crypto";

export async function POST() {
  try {
    const passwordHash = createHash("sha256").update("admin123").digest("hex");

    await db.delete(users);
    await db.insert(users).values([
      {
        name: "Administrateur Principal",
        email: "admin@dancercitoyens.org",
        passwordHash,
        role: "admin",
      },
      {
        name: "Logistique 1",
        email: "logistique1@dancercitoyens.org",
        passwordHash,
        role: "admin",
      },
      {
        name: "Logistique 2",
        email: "logistique2@dancercitoyens.org",
        passwordHash,
        role: "admin",
      },
    ]);

    return NextResponse.json({
      message: "Mots de passe réinitialisés",
      credentials: {
        email: "admin@dancercitoyens.org",
        password: "admin123",
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
