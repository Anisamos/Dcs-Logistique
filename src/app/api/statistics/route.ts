import { NextResponse } from "next/server";
import { db } from "@/db";
import { purchases, stockItems, equipment, projects, spaces } from "@/db/schema";
import { gte, lte, and, sql, eq } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";

export async function GET(request: Request) {
  return withAuth(async () => {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case "daily":
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "weekly":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "quarterly":
          start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "semester":
          start = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case "yearly":
          start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default: // monthly
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Total purchases amount in period
    const purchasesResult = await db.select({
      total: sql<number>`COALESCE(SUM(${purchases.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    }).from(purchases).where(
      and(
        gte(purchases.invoiceDate, start),
        lte(purchases.invoiceDate, end)
      )
    );

    // Purchases by category
    const purchasesByCategory = await db.select({
      category: purchases.category,
      total: sql<number>`COALESCE(SUM(${purchases.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    }).from(purchases).where(
      and(
        gte(purchases.invoiceDate, start),
        lte(purchases.invoiceDate, end)
      )
    ).groupBy(purchases.category);

    // Purchases by month (for charts)
    const purchasesByMonth = await db.select({
      month: sql<string>`strftime('%Y-%m', ${purchases.invoiceDate} / 1000, 'unixepoch')`,
      total: sql<number>`COALESCE(SUM(${purchases.amount}), 0)`,
    }).from(purchases).where(
      and(
        gte(purchases.invoiceDate, start),
        lte(purchases.invoiceDate, end)
      )
    ).groupBy(sql`strftime('%Y-%m', ${purchases.invoiceDate} / 1000, 'unixepoch')`);

    // Purchases by space
    const purchasesBySpace = await db.select({
      spaceId: purchases.spaceId,
      total: sql<number>`COALESCE(SUM(${purchases.amount}), 0)`,
    }).from(purchases).where(
      and(
        gte(purchases.invoiceDate, start),
        lte(purchases.invoiceDate, end),
        sql`${purchases.spaceId} IS NOT NULL`
      )
    ).groupBy(purchases.spaceId);

    // Low stock items
    const lowStock = await db.select().from(stockItems).where(
      sql`${stockItems.quantity} <= ${stockItems.minQuantity}`
    );

    // Stock totals
    const stockTotal = await db.select({
      totalItems: sql<number>`COUNT(*)`,
      totalQuantity: sql<number>`COALESCE(SUM(${stockItems.quantity}), 0)`,
      totalValue: sql<number>`COALESCE(SUM(${stockItems.quantity} * COALESCE(${stockItems.unitPrice}, 0)), 0)`,
    }).from(stockItems);

    // Equipment stats
    const equipmentStats = await db.select({
      totalItems: sql<number>`COUNT(*)`,
      totalQuantity: sql<number>`COALESCE(SUM(${equipment.quantity}), 0)`,
      byCondition: equipment.condition,
      count: sql<number>`COUNT(*)`,
    }).from(equipment).groupBy(equipment.condition);

    // Projects stats
    const projectStats = await db.select({
      status: projects.status,
      count: sql<number>`COUNT(*)`,
    }).from(projects).groupBy(projects.status);

    // Spaces
    const allSpaces = await db.select().from(spaces);

    // Payment status
    const paymentStats = await db.select({
      status: purchases.paymentStatus,
      total: sql<number>`COALESCE(SUM(${purchases.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    }).from(purchases).where(
      and(
        gte(purchases.invoiceDate, start),
        lte(purchases.invoiceDate, end)
      )
    ).groupBy(purchases.paymentStatus);

    return NextResponse.json({
      period: { start: start.toISOString(), end: end.toISOString(), type: period },
      purchases: {
        total: purchasesResult[0]?.total || 0,
        count: purchasesResult[0]?.count || 0,
        byCategory: purchasesByCategory,
        byMonth: purchasesByMonth,
        bySpace: purchasesBySpace,
        paymentStats,
      },
      stock: {
        ...stockTotal[0],
        lowStock,
      },
      equipment: equipmentStats,
      projects: projectStats,
      spaces: allSpaces,
    });
  });
}
