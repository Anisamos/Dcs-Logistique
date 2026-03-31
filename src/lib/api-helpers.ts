import { NextResponse } from "next/server";
import { requireAuth } from "./auth";

export async function withAuth(handler: (userId: number) => Promise<NextResponse>) {
  try {
    const user = await requireAuth();
    return handler(user.id);
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
