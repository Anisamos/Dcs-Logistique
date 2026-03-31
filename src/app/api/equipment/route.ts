import { NextResponse } from "next/server";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";

export async function GET() {
  return withAuth(async () => {
    const all = await db.select().from(equipment);
    return NextResponse.json(all);
  });
}

export async function POST(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const item = await db.insert(equipment).values({
      name: body.name,
      description: body.description || null,
      category: body.category,
      spaceId: body.spaceId || null,
      quantity: body.quantity || 1,
      condition: body.condition || "good",
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      purchasePrice: body.purchasePrice || null,
    }).returning();
    return NextResponse.json(item[0], { status: 201 });
  });
}

export async function PUT(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = await db.update(equipment).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(equipment.id, id)).returning();
    return NextResponse.json(updated[0]);
  });
}

export async function DELETE(request: Request) {
  return withAuth(async () => {
    const { id } = await request.json();
    await db.delete(equipment).where(eq(equipment.id, id));
    return NextResponse.json({ success: true });
  });
}
