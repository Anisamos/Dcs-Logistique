import { NextResponse } from "next/server";
import { db } from "@/db";
import { purchases } from "@/db/schema";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";

export async function GET(request: Request) {
  return withAuth(async () => {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const spaceId = searchParams.get("spaceId");
    const projectId = searchParams.get("projectId");

    const conditions: any[] = [];
    if (startDate) conditions.push(gte(purchases.invoiceDate, new Date(startDate)));
    if (endDate) conditions.push(lte(purchases.invoiceDate, new Date(endDate)));
    if (spaceId) conditions.push(eq(purchases.spaceId, parseInt(spaceId)));
    if (projectId) conditions.push(eq(purchases.projectId, parseInt(projectId)));

    const result = conditions.length > 0
      ? await db.select().from(purchases).where(and(...conditions))
      : await db.select().from(purchases);

    return NextResponse.json(result);
  });
}

export async function POST(request: Request) {
  return withAuth(async (userId) => {
    const body = await request.json();
    const item = await db.insert(purchases).values({
      title: body.title,
      description: body.description || null,
      supplier: body.supplier || null,
      category: body.category,
      amount: body.amount,
      invoiceNumber: body.invoiceNumber || null,
      invoiceDate: new Date(body.invoiceDate),
      paymentStatus: body.paymentStatus || "pending",
      spaceId: body.spaceId || null,
      projectId: body.projectId || null,
      activityId: body.activityId || null,
      createdBy: userId,
    }).returning();
    return NextResponse.json(item[0], { status: 201 });
  });
}

export async function PUT(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = await db.update(purchases).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(purchases.id, id)).returning();
    return NextResponse.json(updated[0]);
  });
}

export async function DELETE(request: Request) {
  return withAuth(async () => {
    const { id } = await request.json();
    await db.delete(purchases).where(eq(purchases.id, id));
    return NextResponse.json({ success: true });
  });
}
