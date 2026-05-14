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
    message: row.message ?? null,
    status: row.status as
      | "new"
      | "contacted"
      | "confirmed"
      | "completed"
      | "rejected",
    createdAt: row.createdAt.toISOString(),
  };
}
