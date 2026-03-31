import { NextResponse } from "next/server";
import { db } from "@/db";
import { spaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";

export async function GET() {
  return withAuth(async () => {
    const allSpaces = await db.select().from(spaces);
    return NextResponse.json(allSpaces);
  });
}

export async function POST(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const newSpace = await db.insert(spaces).values({
      name: body.name,
      description: body.description || null,
      type: body.type,
      status: body.status || "active",
      address: body.address || null,
      surface: body.surface || null,
    }).returning();
    return NextResponse.json(newSpace[0], { status: 201 });
  });
}

export async function PUT(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = await db.update(spaces).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(spaces.id, id)).returning();
    return NextResponse.json(updated[0]);
  });
}

export async function DELETE(request: Request) {
  return withAuth(async () => {
    const { id } = await request.json();
    await db.delete(spaces).where(eq(spaces.id, id));
    return NextResponse.json({ success: true });
  });
}
