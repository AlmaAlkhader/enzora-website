import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, paymentMethodsTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";
import { AdminUpdatePaymentMethodsBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serializePaymentMethod(row: typeof paymentMethodsTable.$inferSelect) {
  return {
    methodKey: row.methodKey as
      | "cash_on_delivery"
      | "cash_on_pickup"
      | "bank_transfer"
      | "mobile_wallet"
      | "contact_us",
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    instructionsEn: row.instructionsEn,
    instructionsAr: row.instructionsAr,
    isActive: row.isActive,
  };
}

router.get("/payment-methods", async (_req, res) => {
  const rows = await db
    .select()
    .from(paymentMethodsTable)
    .where(eq(paymentMethodsTable.isActive, true));
  res.json(
    rows.map((r) => ({
      methodKey: r.methodKey as
        | "cash_on_delivery"
        | "cash_on_pickup"
        | "bank_transfer"
        | "mobile_wallet"
        | "contact_us",
      nameEn: r.nameEn,
      nameAr: r.nameAr,
      instructionsEn: r.instructionsEn,
      instructionsAr: r.instructionsAr,
    })),
  );
});

router.get("/admin/payment-methods", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(paymentMethodsTable);
  res.json(rows.map(serializePaymentMethod));
});

router.put("/admin/payment-methods", requireAdmin, async (req, res) => {
  const parsed = AdminUpdatePaymentMethodsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payment methods input", details: parsed.error.issues });
    return;
  }

  const updated = [];
  for (const item of parsed.data) {
    const [row] = await db
      .update(paymentMethodsTable)
      .set({
        nameEn: item.nameEn,
        nameAr: item.nameAr,
        instructionsEn: item.instructionsEn,
        instructionsAr: item.instructionsAr,
        isActive: item.isActive,
        updatedAt: new Date(),
      })
      .where(eq(paymentMethodsTable.methodKey, item.methodKey))
      .returning();
    if (row) {
      updated.push(serializePaymentMethod(row));
    }
  }

  req.log.info({ count: updated.length }, "Payment methods updated");
  res.json(updated);
});

export default router;
