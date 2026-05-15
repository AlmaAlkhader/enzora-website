import crypto from "node:crypto";
import type { OrderRow } from "@workspace/db";

export function generateReference(): string {
  const part = crypto.randomBytes(3).toString("hex").toUpperCase();
  const year = new Date().getFullYear();
  return `ENZ-${year}-${part}`;
}

export function serializeOrder(row: OrderRow) {
  return {
    id: row.id,
    orderReference: row.orderReference,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    countryCity: row.countryCity,
    country: row.country ?? null,
    city: row.city ?? null,
    customerType: row.customerType as
      | "patient"
      | "caregiver"
      | "clinic"
      | "hospital"
      | "research"
      | "other",
    productSelection: row.productSelection as
      | "bandage_pack"
      | "smart_device"
      | "complete_package",
    quantity: row.quantity,
    productNameSnapshot: row.productNameSnapshot ?? null,
    productPriceSnapshot: row.productPriceSnapshot != null ? parseFloat(row.productPriceSnapshot) : null,
    productCurrencySnapshot: row.productCurrencySnapshot ?? null,
    totalEstimatedPrice: row.totalEstimatedPrice != null ? parseFloat(row.totalEstimatedPrice) : null,
    message: row.message ?? null,
    status: row.status as
      | "new"
      | "contacted"
      | "confirmed"
      | "completed"
      | "rejected",
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
    paymentMethod: (row.paymentMethod ?? null) as
      | "cash_on_delivery"
      | "cash_on_pickup"
      | "bank_transfer"
      | "mobile_wallet"
      | "contact_us"
      | null,
    paymentStatus: (row.paymentStatus ?? "pending") as
      | "pending"
      | "awaiting_confirmation"
      | "paid"
      | "failed"
      | "refunded"
      | "cancelled",
    paymentNote: row.paymentNote ?? null,
    paymentReference: row.paymentReference ?? null,
    amountDue: row.amountDue != null ? parseFloat(row.amountDue) : null,
    currency: row.currency ?? "USD",
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
