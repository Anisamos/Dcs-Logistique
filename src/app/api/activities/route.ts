import { NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";

export async function GET() {
  return withAuth(async () => {
    const all = await db.select().from(activities);
    return NextResponse.json(all);
  });
}

export async function POST(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const item = await db.insert(activities).values({
      name: body.name,
      description: body.description || null,
      type: body.type,
      projectId: body.projectId || null,
      spaceId: body.spaceId || null,
      status: body.status || "planned",
      date: body.date ? new Date(body.date) : null,
      budget: body.budget || null,
    }).returning();
    return NextResponse.json(item[0], { status: 201 });
  });
}

export async function PUT(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = await db.update(activities).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(activities.id, id)).returning();
    return NextResponse.json(updated[0]);
  });
}

export async function DELETE(request: Request) {
  return withAuth(async () => {
    const { id } = await request.json();
    await db.delete(activities).where(eq(activities.id, id));
    return NextResponse.json({ success: true });
  });
}
