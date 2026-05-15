import { useState } from "react";
import { useTrackOrder, useListPaymentMethods, getTrackOrderQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

const PAYMENT_STATUS_LABELS: Record<string, { en: string; ar: string }> = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  awaiting_confirmation: { en: "Awaiting Confirmation", ar: "في انتظار التأكيد" },
  paid: { en: "Paid", ar: "مدفوع" },
  failed: { en: "Failed", ar: "فشل" },
  refunded: { en: "Refunded", ar: "مُسترجَع" },
  cancelled: { en: "Cancelled", ar: "ملغى" },
};

const ORDER_STATUS_LABELS: Record<string, { en: string; ar: string }> = {
  new: { en: "Received", ar: "تم الاستلام" },
  contacted: { en: "Contacted", ar: "تم التواصل" },
  confirmed: { en: "Confirmed", ar: "مؤكد" },
  completed: { en: "Completed", ar: "مكتمل" },
  rejected: { en: "Rejected", ar: "مرفوض" },
};

const PAYMENT_METHOD_LABELS: Record<string, { en: string; ar: string }> = {
  cash_on_delivery: { en: "Cash on Delivery", ar: "الدفع عند الاستلام" },
  cash_on_pickup: { en: "Cash on Pickup", ar: "الدفع عند الاستلام الشخصي" },
  bank_transfer: { en: "Bank Transfer", ar: "تحويل بنكي" },
  mobile_wallet: { en: "Mobile Wallet Transfer", ar: "تحويل عبر المحفظة الإلكترونية" },
  contact_us: { en: "Contact Us to Arrange", ar: "تواصل معنا للترتيب" },
};

const LOGO_SRC = `${import.meta.env.BASE_URL}enzora-logo.png`;

export default function OrderTracking() {
  const [ref, setRef] = useState("");
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isAr = lang === "ar";

  const trackParams = { ref: submittedRef ?? "" };
  const { data: order, isLoading, isError } = useTrackOrder(
    trackParams,
    { query: { enabled: !!submittedRef, retry: false, queryKey: getTrackOrderQueryKey(trackParams) } },
  );

  const { data: paymentMethods = [] } = useListPaymentMethods();

  const resolvedPaymentMethodName = (key: string | null | undefined, ar: boolean): string | null => {
    if (!key) return null;
    const live = paymentMethods.find((m) => m.methodKey === key);
    if (live) return ar ? live.nameAr : live.nameEn;
    const fallback = PAYMENT_METHOD_LABELS[key];
    if (fallback) return ar ? fallback.ar : fallback.en;
    return key;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ref.trim().toUpperCase();
    if (trimmed) setSubmittedRef(trimmed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={isAr ? "rtl" : "ltr"}>
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <img src={LOGO_SRC} alt="Enzora" className="h-10 w-auto cursor-pointer" />
        </Link>
        <button
          onClick={() => setLang(isAr ? "en" : "ar")}
          className="text-xs font-semibold uppercase tracking-wider text-primary/80 hover:text-primary border border-primary/20 rounded-full px-3 py-1.5 transition-colors"
        >
          {isAr ? "EN" : "عربي"}
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          <div className={isAr ? "text-right" : ""}>
            <h1 className="text-3xl font-bold text-foreground">
              {isAr ? "تتبع طلبك" : "Track Your Order"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isAr
                ? "أدخل رقم المرجع الخاص بطلبك لمشاهدة حالته."
                : "Enter your order reference number to check its status."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder={isAr ? "مثال: ENZ-2026-ABC123" : "e.g. ENZ-2026-ABC123"}
              className="h-12 font-mono flex-1"
              dir="ltr"
            />
            <Button type="submit" className="h-12 px-6">
              {isAr ? "بحث" : "Track"}
            </Button>
          </form>

          {isLoading && (
            <div className="bg-white rounded-xl border p-6 text-center text-muted-foreground">
              {isAr ? "جارٍ البحث..." : "Looking up your order..."}
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 font-medium">
                {isAr ? "لم يتم العثور على الطلب." : "Order not found."}
              </p>
              <p className="text-sm text-red-500 mt-1">
                {isAr
                  ? "تحقق من رقم المرجع وحاول مرة أخرى."
                  : "Please check the reference number and try again."}
              </p>
            </div>
          )}

          {order && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-gray-50/50">
                <div className="font-mono text-sm text-muted-foreground">{isAr ? "المرجع" : "Reference"}</div>
                <div className="font-mono font-semibold text-lg mt-0.5">{order.orderReference}</div>
              </div>

              <div className="divide-y">
                <InfoRow
                  label={isAr ? "المنتج" : "Product"}
                  value={order.productNameSnapshot ?? order.productSelection}
                />
                <InfoRow
                  label={isAr ? "الكمية" : "Quantity"}
                  value={String(order.quantity)}
                />
                <InfoRow
                  label={isAr ? "حالة الطلب" : "Order Status"}
                  value={
                    <StatusBadge
                      status={order.status}
                      label={
                        (isAr
                          ? ORDER_STATUS_LABELS[order.status]?.ar
                          : ORDER_STATUS_LABELS[order.status]?.en) ?? order.status
                      }
                      variant={
                        order.status === "completed"
                          ? "success"
                          : order.status === "rejected"
                          ? "error"
                          : order.status === "confirmed"
                          ? "info"
                          : "neutral"
                      }
                    />
                  }
                />
                <InfoRow
                  label={isAr ? "طريقة الدفع" : "Payment Method"}
                  value={
                    resolvedPaymentMethodName(order.paymentMethod, isAr) ?? (isAr ? "—" : "—")
                  }
                />
                <InfoRow
                  label={isAr ? "حالة الدفع" : "Payment Status"}
                  value={
                    <StatusBadge
                      status={order.paymentStatus}
                      label={
                        (isAr
                          ? PAYMENT_STATUS_LABELS[order.paymentStatus]?.ar
                          : PAYMENT_STATUS_LABELS[order.paymentStatus]?.en) ?? order.paymentStatus
                      }
                      variant={
                        order.paymentStatus === "paid"
                          ? "success"
                          : order.paymentStatus === "failed" || order.paymentStatus === "cancelled"
                          ? "error"
                          : order.paymentStatus === "awaiting_confirmation"
                          ? "info"
                          : "neutral"
                      }
                    />
                  }
                />
                {order.amountDue != null && (
                  <InfoRow
                    label={isAr ? "المبلغ المستحق" : "Amount Due"}
                    value={`${order.currency} ${Number(order.amountDue).toFixed(2)}`}
                  />
                )}
                <InfoRow
                  label={isAr ? "تاريخ الطلب" : "Order Date"}
                  value={new Date(order.createdAt).toLocaleDateString(isAr ? "ar" : "en", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                />
              </div>

              <div className="p-4 border-t bg-gray-50/50">
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? "للاستفسارات، تواصل مع فريقنا على hello@enzora.health"
                    : "For inquiries, contact our team at hello@enzora.health"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function StatusBadge({
  label,
  variant,
}: {
  status: string;
  label: string;
  variant: "success" | "error" | "info" | "neutral";
}) {
  const colors: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}>
      {label}
    </span>
  );
}
