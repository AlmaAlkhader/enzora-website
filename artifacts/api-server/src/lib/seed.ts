import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const DEFAULT_PRODUCTS = [
  {
    productKey: "bandage_pack",
    name: "Enzora Bandage Pack",
    description: "5 bandages included",
    price: "20.00",
    currency: "USD",
    priceLabel: null as string | null,
    isActive: true,
  },
  {
    productKey: "smart_device",
    name: "Enzora Smart Device",
    description: "Reads Enzora bandage color changes and connects to the mobile app.",
    price: null as string | null,
    currency: "USD",
    priceLabel: "Contact us for pricing",
    isActive: true,
  },
  {
    productKey: "complete_package",
    name: "Complete Enzora Package",
    description: "Device + bandage pack",
    price: null as string | null,
    currency: "USD",
    priceLabel: "Contact us for pricing",
    isActive: true,
  },
];

export async function seedProducts(): Promise<void> {
  for (const product of DEFAULT_PRODUCTS) {
    const existing = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.productKey, product.productKey));

    if (existing.length === 0) {
      await db.insert(productsTable).values(product);
      logger.info({ productKey: product.productKey }, "Seeded product");
    }
  }
}
