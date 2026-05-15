import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { AdminLoginBody, UpdateOrderStatusBody, UpdateOrderPaymentBody } from "@workspace/api-zod";
import { db, ordersTable } from "@workspace/db";
import {
  getAdminCredentials,
  issueAdminToken,
  requireAdmin,
  verifyAdminCredentials,
} from "../lib/auth";
import { serializeOrder } from "../lib/orders";

const router: IRouter = Router();

const ALLOWED_PAYMENT_STATUSES = new Set([
  "pending",
  "awaiting_confirmation",
  "paid",
  "failed",
  "refunded",
  "cancelled",
]);

router.post("/admin/login", (req, res) => {
  if (!getAdminCredentials()) {
    res.status(503).json({
      error:
        "Admin credentials not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and SESSION_SECRET in Replit Secrets.",
    });
    return;
  }
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid login input" });
    return;
  }
  if (!verifyAdminCredentials(parsed.data.email, parsed.data.password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const token = issueAdminToken();
  if (!token) {
    res.status(503).json({ error: "Admin credentials not configured" });
    return;
  }
  res.json({ token });
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
        ilike(ordersTable.orderReference, like),
        ilike(ordersTable.countryCity, like),
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

router.patch("/admin/orders/:id/payment", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateOrderPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payment input", details: parsed.error.issues });
    return;
  }

  const update: Record<string, unknown> = {};

  if (parsed.data.paymentStatus !== undefined) {
    const newStatus = parsed.data.paymentStatus;
    if (!ALLOWED_PAYMENT_STATUSES.has(newStatus)) {
      res.status(400).json({ error: "Invalid payment status" });
      return;
    }
    update["paymentStatus"] = newStatus;
    if (newStatus === "paid") {
      update["paidAt"] = new Date();
    } else {
      update["paidAt"] = null;
    }
  }

  if ("paymentNote" in parsed.data) {
    update["paymentNote"] = parsed.data.paymentNote ?? null;
  }

  if ("paymentReference" in parsed.data) {
    update["paymentReference"] = parsed.data.paymentReference ?? null;
  }

  if ("amountDue" in parsed.data) {
    update["amountDue"] = parsed.data.amountDue != null ? String(parsed.data.amountDue) : null;
  }

  if (Object.keys(update).length === 0) {
    const [existing] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serializeOrder(existing));
    return;
  }

  const [row] = await db
    .update(ordersTable)
    .set(update)
    .where(eq(ordersTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  req.log.info({ id, update }, "Order payment updated");
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
