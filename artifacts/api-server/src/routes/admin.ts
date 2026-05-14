import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { AdminLoginBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { db, ordersTable } from "@workspace/db";
import {
  getAdminPassword,
  issueAdminToken,
  requireAdmin,
} from "../lib/auth";
import { serializeOrder } from "../lib/orders";

const router: IRouter = Router();

router.post("/admin/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid login input" });
    return;
  }
  if (parsed.data.password !== getAdminPassword()) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  res.json({ token: issueAdminToken() });
});

router.get("/admin/me", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

router.get("/admin/orders", requireAdmin, async (req, res) => {
  const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
  const search = typeof req.query["search"] === "string" ? req.query["search"].trim() : "";

  const allowedStatuses = new Set([
    "new",
    "contacted",
    "confirmed",
    "completed",
    "rejected",
  ]);

  const conditions = [];
  if (status && allowedStatuses.has(status)) {
    conditions.push(eq(ordersTable.status, status));
  }
  if (search) {
    const like = `%${search}%`;
    conditions.push(
      or(
        ilike(ordersTable.fullName, like),
        ilike(ordersTable.email, like),
        ilike(ordersTable.reference, like),
        ilike(ordersTable.location, like),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(ordersTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(ordersTable.createdAt));

  res.json(rows.map(serializeOrder));
});

router.get("/admin/orders/summary", requireAdmin, async (_req, res) => {
  const counts = await db
    .select({
      status: ordersTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(ordersTable)
    .groupBy(ordersTable.status);

  const byStatus = {
    new: 0,
    contacted: 0,
    confirmed: 0,
    completed: 0,
    rejected: 0,
  };
  let total = 0;
  for (const row of counts) {
    total += row.count;
    if (row.status in byStatus) {
      byStatus[row.status as keyof typeof byStatus] = row.count;
    }
  }

  const recent = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(5);

  res.json({
    total,
    byStatus,
    recent: recent.map(serializeOrder),
  });
});

router.get("/admin/orders/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeOrder(row));
});

router.patch("/admin/orders/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status input" });
    return;
  }
  const [row] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeOrder(row));
});

router.delete("/admin/orders/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const result = await db.delete(ordersTable).where(eq(ordersTable.id, id)).returning();
  if (result.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).end();
});

export default router;
