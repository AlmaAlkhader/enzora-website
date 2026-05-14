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
  const reference = generateReference();
  const [row] = await db
    .insert(ordersTable)
    .values({
      reference,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      location: input.location,
      customerType: input.customerType,
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
    reference: serialized.reference,
    status: serialized.status,
  });
});

export default router;
