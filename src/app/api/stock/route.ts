import { NextResponse } from "next/server";
import { db } from "@/db";
import { stockItems, stockMovements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";

export async function GET() {
  return withAuth(async () => {
    const items = await db.select().from(stockItems);
    return NextResponse.json(items);
  });
}

export async function POST(request: Request) {
  return withAuth(async (userId) => {
    const body = await request.json();

    if (body.action === "movement") {
      const movement = await db.insert(stockMovements).values({
        stockItemId: body.stockItemId,
        type: body.type,
        quantity: body.quantity,
        reason: body.reason || null,
        reference: body.reference || null,
        notes: body.notes || null,
        createdBy: userId,
      }).returning();

      const item = await db.select().from(stockItems).where(eq(stockItems.id, body.stockItemId));
      if (item[0]) {
        const newQty = body.type === "in"
          ? item[0].quantity + body.quantity
          : item[0].quantity - body.quantity;
        await db.update(stockItems).set({ quantity: Math.max(0, newQty), updatedAt: new Date() })
          .where(eq(stockItems.id, body.stockItemId));
      }

      return NextResponse.json(movement[0], { status: 201 });
    }

    const item = await db.insert(stockItems).values({
      name: body.name,
      description: body.description || null,
      category: body.category,
      unit: body.unit || "piece",
      quantity: body.quantity || 0,
      minQuantity: body.minQuantity || 0,
      unitPrice: body.unitPrice || null,
      spaceId: body.spaceId || null,
    }).returning();
    return NextResponse.json(item[0], { status: 201 });
  });
}

export async function PUT(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = await db.update(stockItems).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(stockItems.id, id)).returning();
    return NextResponse.json(updated[0]);
  });
}

export async function DELETE(request: Request) {
  return withAuth(async () => {
    const { id } = await request.json();
    await db.delete(stockMovements).where(eq(stockMovements.stockItemId, id));
    await db.delete(stockItems).where(eq(stockItems.id, id));
    return NextResponse.json({ success: true });
  });
}
