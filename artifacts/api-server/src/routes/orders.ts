import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";
import { db, ordersTable, productsTable } from "@workspace/db";
import { generateReference, serializeOrder } from "../lib/orders";

const router: IRouter = Router();

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order input", details: parsed.error.issues });
    return;
  }
  const input = parsed.data;
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
  });
});

export default router;
