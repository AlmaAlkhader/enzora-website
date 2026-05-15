import { db, productsTable, paymentMethodsTable } from "@workspace/db";
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

const DEFAULT_PAYMENT_METHODS = [
  {
    methodKey: "cash_on_delivery",
    nameEn: "Cash on Delivery",
    nameAr: "الدفع عند الاستلام",
    instructionsEn: "You can pay when your order is delivered.",
    instructionsAr: "يمكنك الدفع عند استلام طلبك.",
    isActive: true,
  },
  {
    methodKey: "cash_on_pickup",
    nameEn: "Cash on Pickup",
    nameAr: "الدفع عند الاستلام الشخصي",
    instructionsEn: "You can pay when you pick up your order.",
    instructionsAr: "يمكنك الدفع عند استلام طلبك شخصياً.",
    isActive: true,
  },
  {
    methodKey: "bank_transfer",
    nameEn: "Bank Transfer",
    nameAr: "تحويل بنكي",
    instructionsEn: "Our team will contact you with bank transfer details after confirming your order.",
    instructionsAr: "سيتواصل معك فريقنا لتزويدك بتفاصيل التحويل البنكي بعد تأكيد طلبك.",
    isActive: true,
  },
  {
    methodKey: "mobile_wallet",
    nameEn: "Mobile Wallet Transfer",
    nameAr: "تحويل عبر المحفظة الإلكترونية",
    instructionsEn: "Our team will contact you with mobile wallet transfer details after confirming your order.",
    instructionsAr: "سيتواصل معك فريقنا لتزويدك بتفاصيل التحويل عبر المحفظة الإلكترونية بعد تأكيد طلبك.",
    isActive: true,
  },
  {
    methodKey: "contact_us",
    nameEn: "Contact Us to Arrange",
    nameAr: "تواصل معنا للترتيب",
    instructionsEn: "Our team will contact you to arrange a suitable payment method.",
    instructionsAr: "سيتواصل معك فريقنا لترتيب طريقة دفع مناسبة لك.",
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

export async function seedPaymentMethods(): Promise<void> {
  for (const method of DEFAULT_PAYMENT_METHODS) {
    const existing = await db
      .select({ id: paymentMethodsTable.id })
      .from(paymentMethodsTable)
      .where(eq(paymentMethodsTable.methodKey, method.methodKey));

    if (existing.length === 0) {
      await db.insert(paymentMethodsTable).values(method);
      logger.info({ methodKey: method.methodKey }, "Seeded payment method");
    }
  }
}
