import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import type { ProductRow, ProductDimension } from "@workspace/db";
import { requireAdmin } from "../lib/auth";
import { AdminUpdateProductBody } from "@workspace/api-zod";

const router: IRouter = Router();

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  ILS: "₪",
  JOD: "JD ",
};

function formatPrice(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency} `;
  const formatted = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${symbol}${formatted}`;
}

function computeDisplayText(row: ProductRow): string {
  if (row.price != null) {
    return formatPrice(parseFloat(row.price), row.currency);
  }
  return row.priceLabel ?? "Contact us for pricing";
}

function serializeProduct(row: ProductRow, includeInactive: true): {
  productKey: "bandage_pack" | "smart_device" | "complete_package";
  name: string;
  description: string;
  price: number | null;
  currency: string;
  priceLabel: string | null;
  displayText: string;
  dimensions: ProductDimension[];
  isActive: boolean;
};
function serializeProduct(row: ProductRow, includeInactive?: false): {
  productKey: "bandage_pack" | "smart_device" | "complete_package";
  name: string;
  description: string;
  price: number | null;
  currency: string;
  priceLabel: string | null;
  displayText: string;
  dimensions: ProductDimension[];
};
function serializeProduct(row: ProductRow, includeInactive = false) {
  const base = {
    productKey: row.productKey as "bandage_pack" | "smart_device" | "complete_package",
    name: row.name,
    description: row.description,
    price: row.price != null ? parseFloat(row.price) : null,
    currency: row.currency,
    priceLabel: row.priceLabel ?? null,
    displayText: computeDisplayText(row),
    dimensions: Array.isArray(row.dimensions) ? row.dimensions : [],
  };
  if (includeInactive) {
    return { ...base, isActive: row.isActive };
  }
  return base;
}

router.get("/products", async (_req, res) => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isActive, true));
  res.json(rows.map((r) => serializeProduct(r)));
});

router.get("/admin/products", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(productsTable);
  res.json(rows.map((r) => serializeProduct(r, true)));
});

router.put("/admin/products/:product_key", requireAdmin, async (req, res) => {
  const productKey = String(req.params["product_key"] ?? "");
  if (!productKey) {
    res.status(400).json({ error: "Missing product_key" });
    return;
  }

  const parsed = AdminUpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product input", details: parsed.error.issues });
    return;
  }

  const { name, description, price, currency, priceLabel, isActive, dimensions } = parsed.data;

  const updateValues: Record<string, unknown> = {
    name,
    description,
    price: price != null ? String(price) : null,
    currency,
    priceLabel: priceLabel ?? null,
    isActive,
    updatedAt: new Date(),
  };

  // Only overwrite dimensions when the client explicitly sends the field.
  // Omitting dimensions preserves the existing saved value.
  if (dimensions !== undefined) {
    const cleanDimensions: ProductDimension[] = Array.isArray(dimensions)
      ? dimensions
          .map((d) => ({ label: String(d.label ?? "").trim(), value: String(d.value ?? "").trim() }))
          .filter((d) => d.label.length > 0 && d.value.length > 0)
      : [];
    updateValues["dimensions"] = cleanDimensions;
  }

  const [row] = await db
    .update(productsTable)
    .set(updateValues)
    .where(eq(productsTable.productKey, productKey))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  req.log.info({ productKey }, "Product updated");
  res.json(serializeProduct(row, true));
});

export default router;
