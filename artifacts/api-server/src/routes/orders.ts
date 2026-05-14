import { Router, type IRouter } from "express";
import { CreateOrderBody } from "@workspace/api-zod";
import { db, ordersTable } from "@workspace/db";
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
