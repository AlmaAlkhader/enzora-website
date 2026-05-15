import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { CreateOrderBody } from "@workspace/api-zod";
import { db, ordersTable, productsTable, paymentMethodsTable } from "@workspace/db";
import { generateReference, serializeOrder } from "../lib/orders";

const router: IRouter = Router();

const TrackOrderBody = z.object({
  orderReference: z.string().min(1),
  emailOrPhone: z.string().min(1),
});

router.post("/orders/track", async (req, res) => {
  const parsed = TrackOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { orderReference, emailOrPhone } = parsed.data;
  const trimmedRef = orderReference.trim().toUpperCase();
  const trimmedInput = emailOrPhone.trim();

  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderReference, trimmedRef));

  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const emailMatch = row.email.toLowerCase() === trimmedInput.toLowerCase();
  const phoneMatch =
    row.phone.replace(/[\s\-]/g, "") === trimmedInput.replace(/[\s\-]/g, "");
  if (!emailMatch && !phoneMatch) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json({
    orderReference: row.orderReference,
    productNameSnapshot: row.productNameSnapshot ?? null,
    productSelection: row.productSelection as "bandage_pack" | "smart_device" | "complete_package",
    quantity: row.quantity,
    status: row.status as "new" | "contacted" | "confirmed" | "completed" | "rejected",
    trackingStage: (row.trackingStage ?? "order_submitted") as
      | "order_submitted"
      | "order_reviewed"
      | "customer_contacted"
      | "confirmed"
      | "preparing_order"
      | "ready_for_pickup"
      | "completed"
      | "rejected",
    trackingLocation: row.trackingLocation ?? null,
    trackingNote: row.trackingNote ?? null,
    updatedAt: row.updatedAt.toISOString(),
  });
});

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order input", details: parsed.error.issues });
    return;
  }
  const input = parsed.data;

  const [activeMethod] = await db
    .select()
    .from(paymentMethodsTable)
    .where(eq(paymentMethodsTable.methodKey, input.paymentMethod));

  if (!activeMethod || !activeMethod.isActive) {
    res.status(400).json({ error: "Selected payment method is not available" });
    return;
  }

  const orderReference = generateReference();
  const country = input.country ?? null;
  const city = input.city ?? null;
  const countryCity =
    country && city
      ? `${city}, ${country}`
      : input.countryCity ?? (country ?? city ?? "");

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.productKey, input.productSelection));

  const productNameSnapshot = product?.name ?? null;
  const productPriceSnapshot = product?.price != null ? product.price : null;
  const productCurrencySnapshot = product?.currency ?? null;
  const totalEstimatedPrice =
    productPriceSnapshot != null
      ? String(parseFloat(productPriceSnapshot) * input.quantity)
      : null;

  const amountDue =
    productPriceSnapshot != null
      ? String(parseFloat(productPriceSnapshot) * input.quantity)
      : null;

  const currency = productCurrencySnapshot ?? "USD";

  const isArabic = (input as { language?: string }).language === "ar";
  const defaultTrackingNote = isArabic
    ? "تم إرسال طلبك بنجاح. سيتواصل معك فريقنا قريبًا."
    : "Your order request was submitted successfully. Our team will contact you soon.";

  const [row] = await db
    .insert(ordersTable)
    .values({
      orderReference,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      countryCity,
      country,
      city,
      customerType: input.customerType,
      productSelection: input.productSelection,
      quantity: input.quantity,
      productNameSnapshot,
      productPriceSnapshot,
      productCurrencySnapshot,
      totalEstimatedPrice,
      message: input.message ?? null,
      status: "new",
      trackingStage: "order_submitted",
      trackingNote: defaultTrackingNote,
      paymentMethod: input.paymentMethod,
      paymentStatus: "pending",
      amountDue,
      currency,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create order" });
    return;
  }
  const serialized = serializeOrder(row);
  res.status(201).json({
    id: serialized.id,
    orderReference: serialized.orderReference,
    status: serialized.status,
    paymentMethod: serialized.paymentMethod,
    paymentStatus: serialized.paymentStatus,
    amountDue: serialized.amountDue,
    currency: serialized.currency,
  });
});

export default router;
