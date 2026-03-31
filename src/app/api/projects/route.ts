import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, activities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";

export async function GET() {
  return withAuth(async () => {
    const allProjects = await db.select().from(projects);
    return NextResponse.json(allProjects);
  });
}

export async function POST(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const item = await db.insert(projects).values({
      name: body.name,
      description: body.description || null,
      status: body.status || "planning",
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      budget: body.budget || null,
    }).returning();
    return NextResponse.json(item[0], { status: 201 });
  });
}

export async function PUT(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = await db.update(projects).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(projects.id, id)).returning();
    return NextResponse.json(updated[0]);
  });
}

export async function DELETE(request: Request) {
  return withAuth(async () => {
    const { id } = await request.json();
    await db.delete(activities).where(eq(activities.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
    return NextResponse.json({ success: true });
  });
}
