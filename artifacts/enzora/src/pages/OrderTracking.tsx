import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { OrderTrackingResult, TrackingStage } from "@workspace/api-client-react";

const LOGO_SRC = `${import.meta.env.BASE_URL}enzora-logo.png`;

const TRACKING_STAGES: TrackingStage[] = [
  "order_submitted",
  "order_reviewed",
  "customer_contacted",
  "confirmed",
  "preparing_order",
  "ready_for_pickup",
  "completed",
  "rejected",
];

const STAGE_LABELS: Record<TrackingStage, { en: string; ar: string }> = {
  order_submitted: { en: "Order Submitted", ar: "تم إرسال الطلب" },
  order_reviewed: { en: "Order Reviewed", ar: "تمت مراجعة الطلب" },
  customer_contacted: { en: "Customer Contacted", ar: "تم التواصل مع العميل" },
  confirmed: { en: "Confirmed", ar: "مؤكد" },
  preparing_order: { en: "Preparing Order", ar: "جارٍ تجهيز الطلب" },
  ready_for_pickup: { en: "Ready for Pickup / Delivery", ar: "جاهز للاستلام أو التسليم" },
  completed: { en: "Completed", ar: "مكتمل" },
  rejected: { en: "Rejected / Cancelled", ar: "مرفوض / ملغى" },
};

const NEGATIVE_STAGES: Set<TrackingStage> = new Set(["rejected"]);

const PRODUCT_LABELS: Record<string, { en: string; ar: string }> = {
  bandage_pack: { en: "Enzora Bandage Pack", ar: "حزمة ضمادات إنزورا" },
  smart_device: { en: "Enzora Smart Device", ar: "جهاز إنزورا الذكي" },
  complete_package: { en: "Complete Enzora Package", ar: "حزمة إنزورا الكاملة" },
};

function getStageIndex(stage: TrackingStage): number {
  if (stage === "rejected") return -1;
  return TRACKING_STAGES.filter((s) => s !== "rejected").indexOf(stage);
}

function TrackingTimeline({
  currentStage,
  isAr,
}: {
  currentStage: TrackingStage;
  isAr: boolean;
}) {
  const isRejected = currentStage === "rejected";
  const activeStages = TRACKING_STAGES.filter((s) => s !== "rejected");
  const currentIdx = getStageIndex(currentStage);

  if (isRejected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-base font-bold">✕</div>
        <div>
          <div className="font-semibold text-red-700">
            {isAr ? "مرفوض / ملغى" : "Rejected / Cancelled"}
          </div>
          <div className="text-sm text-red-600 mt-0.5">
            {isAr
              ? "تم رفض أو إلغاء هذا الطلب."
              : "This order has been rejected or cancelled."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: horizontal stepper */}
      <div className="hidden md:block overflow-x-auto">
        <div className="flex items-start gap-0 min-w-max">
          {activeStages.map((stage, idx) => {
            const isDone = idx < currentIdx;
            const isActive = idx === currentIdx;
            const label = isAr ? STAGE_LABELS[stage].ar : STAGE_LABELS[stage].en;

            return (
              <div key={stage} className="flex items-start">
                <div className="flex flex-col items-center w-28">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors",
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <div
                    className={cn(
                      "text-xs text-center mt-2 leading-tight font-medium px-1",
                      isDone
                        ? "text-emerald-700"
                        : isActive
                        ? "text-indigo-700"
                        : "text-gray-400"
                    )}
                  >
                    {label}
                  </div>
                </div>
                {idx < activeStages.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-4 mt-4 flex-shrink-0 transition-colors",
                      idx < currentIdx ? "bg-emerald-400" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="md:hidden space-y-1">
        {activeStages.map((stage, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          const label = isAr ? STAGE_LABELS[stage].ar : STAGE_LABELS[stage].en;

          return (
            <div key={stage} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isActive
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                {idx < activeStages.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-4 mt-1",
                      idx < currentIdx ? "bg-emerald-400" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
              <div className="pb-2 pt-0.5">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isDone
                      ? "text-emerald-700"
                      : isActive
                      ? "text-indigo-700"
                      : "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function OrderTracking() {
  const [location] = useLocation();
  const [refInput, setRefInput] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [result, setResult] = useState<OrderTrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isAr = lang === "ar";

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] ?? "");
    const refFromUrl = params.get("ref");
    if (refFromUrl) {
      setRefInput(refFromUrl.toUpperCase());
    }
    const stored = (() => {
      try { return localStorage.getItem("enzora-lang"); } catch { return null; }
    })();
    if (stored === "ar") setLang("ar");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedRef = refInput.trim().toUpperCase();
    const trimmedContact = emailOrPhone.trim();
    if (!trimmedRef || !trimmedContact) return;
    setResult(null);
    setIsNotFound(false);
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderReference: trimmedRef, emailOrPhone: trimmedContact }),
      });
      if (!res.ok) {
        setIsNotFound(true);
      } else {
        const data = (await res.json()) as OrderTrackingResult;
        setResult(data);
      }
    } catch {
      setIsNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const productName = (key: string | null) => {
    if (!key) return key;
    const labels = PRODUCT_LABELS[key];
    if (!labels) return key;
    return isAr ? labels.ar : labels.en;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col" dir={isAr ? "rtl" : "ltr"}>
      <header className="bg-white/80 backdrop-blur border-b border-primary/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
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
        <div className="w-full max-w-xl space-y-6">
          <div className={isAr ? "text-right" : ""}>
            <h1 className="text-3xl font-bold text-foreground">
              {isAr ? "تتبع طلبك" : "Track Your Order"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isAr
                ? "أدخل رقم مرجع طلبك مع بريدك الإلكتروني أو رقم هاتفك."
                : "Enter your order reference and your email or phone number."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-primary/10 shadow-sm p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {isAr ? "رقم المرجع" : "Order Reference"}
              </label>
              <Input
                value={refInput}
                onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                placeholder={isAr ? "مثال: ENZ-2026-ABC123" : "e.g. ENZ-2026-ABC123"}
                className="h-11 font-mono"
                dir="ltr"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {isAr ? "البريد الإلكتروني أو رقم الهاتف" : "Email or Phone Number"}
              </label>
              <Input
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={isAr ? "البريد الإلكتروني أو رقم الهاتف" : "Email or phone used when ordering"}
                className="h-11"
                dir="auto"
                required
              />
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "استخدم نفس البريد الإلكتروني أو رقم الهاتف الذي أدخلته عند تقديم الطلب."
                  : "Use the same email or phone you provided when placing the order."}
              </p>
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl" disabled={isLoading}>
              {isLoading
                ? (isAr ? "جارٍ البحث..." : "Looking up...")
                : (isAr ? "تتبع الطلب" : "Track Order")}
            </Button>
          </form>

          {isNotFound && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">🔍</div>
              <p className="font-semibold text-amber-800">
                {isAr ? "لم نتمكن من العثور على هذا الطلب" : "We couldn't find that order"}
              </p>
              <p className="text-sm text-amber-700 mt-1.5">
                {isAr
                  ? "تحقق من رقم المرجع والبريد الإلكتروني أو رقم الهاتف وحاول مرة أخرى."
                  : "Please check your reference number and email or phone, then try again."}
              </p>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-gradient-to-r from-indigo-50 to-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {isAr ? "رقم المرجع" : "Order Reference"}
                    </div>
                    <div className="font-mono font-bold text-lg mt-0.5 text-primary">
                      {result.orderReference}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold",
                      NEGATIVE_STAGES.has(result.trackingStage)
                        ? "bg-red-100 text-red-700"
                        : result.trackingStage === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-indigo-100 text-indigo-700"
                    )}>
                      {isAr
                        ? STAGE_LABELS[result.trackingStage].ar
                        : STAGE_LABELS[result.trackingStage].en}
                    </div>
                    <div className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      result.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : result.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : result.status === "confirmed"
                        ? "bg-violet-100 text-violet-700"
                        : result.status === "contacted"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {isAr
                        ? {
                            new: "جديد",
                            contacted: "تم التواصل",
                            confirmed: "مؤكد",
                            completed: "مكتمل",
                            rejected: "مرفوض",
                          }[result.status] ?? result.status
                        : {
                            new: "New",
                            contacted: "Contacted",
                            confirmed: "Confirmed",
                            completed: "Completed",
                            rejected: "Rejected",
                          }[result.status] ?? result.status}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      {isAr ? "المنتج" : "Product"}
                    </div>
                    <div className="font-medium">
                      {productName(result.productNameSnapshot ?? result.productSelection) ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      {isAr ? "الكمية" : "Quantity"}
                    </div>
                    <div className="font-medium">{result.quantity}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    {isAr ? "مرحلة الطلب" : "Order Progress"}
                  </div>
                  <TrackingTimeline currentStage={result.trackingStage} isAr={isAr} />
                </div>

                {result.trackingNote && (
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <div className="text-xs font-medium uppercase tracking-wider text-indigo-600 mb-1.5">
                      {isAr ? "آخر تحديث" : "Latest Update"}
                    </div>
                    <p className="text-sm text-indigo-900 leading-relaxed">{result.trackingNote}</p>
                  </div>
                )}

                {result.trackingLocation && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-base mt-0.5">📍</span>
                    <span>{result.trackingLocation}</span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground border-t pt-3">
                  {isAr ? "آخر تحديث:" : "Last updated:"}{" "}
                  {new Date(result.updatedAt).toLocaleString(isAr ? "ar" : "en", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="px-5 py-3 border-t bg-gray-50/50">
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
