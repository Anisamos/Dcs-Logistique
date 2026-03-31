import { NextResponse } from "next/server";
import { db } from "@/db";
import { cleanlinessChecks } from "@/db/schema";
import { withAuth } from "@/lib/api-helpers";

export async function GET() {
  return withAuth(async () => {
    const all = await db.select().from(cleanlinessChecks);
    return NextResponse.json(all);
  });
}

export async function POST(request: Request) {
  return withAuth(async (userId) => {
    const body = await request.json();
    const item = await db.insert(cleanlinessChecks).values({
      spaceId: body.spaceId,
      status: body.status,
      notes: body.notes || null,
      checkedBy: userId,
    }).returning();
    return NextResponse.json(item[0], { status: 201 });
  });
}
