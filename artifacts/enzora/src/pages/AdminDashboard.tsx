import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminMe,
  getAdminMeQueryKey,
  useGetOrdersSummary,
  useListOrders,
  useUpdateOrderStatus,
  useDeleteOrder,
  useUpdateOrderPayment,
  useUpdateOrderTracking,
  getListOrdersQueryKey,
  getGetOrdersSummaryQueryKey,
  useAdminListProducts,
  getAdminListProductsQueryKey,
  useAdminUpdateProduct,
  useAdminListPaymentMethods,
  useAdminUpdatePaymentMethods,
  getAdminListPaymentMethodsQueryKey,
  PaymentMethodKey,
  PaymentStatus,
  OrderStatus,
  TrackingStage,
  type AdminProduct,
  type Order,
  type AdminPaymentMethod,
} from "@workspace/api-client-react";
import { clearAdminToken } from "@/lib/auth-fetch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { SocialIcons } from "@/components/SocialIcons";
import { SocialLinksEditor } from "@/components/SocialLinksEditor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronUp } from "lucide-react";

const productLabel = (p?: string | null) => {
  switch (p) {
    case "bandage_pack": return "Enzora Bandage Pack";
    case "smart_device": return "Enzora Smart Device";
    case "complete_package": return "Complete Enzora Package";
    default: return p ?? "—";
  }
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  awaiting_confirmation: "Awaiting Confirmation",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

type Tab = "orders" | "products" | "payment-settings" | "settings";

type EditState = {
  price: string;
  currency: string;
  priceLabel: string;
};

type PaymentEditState = {
  paymentNote: string;
  paymentReference: string;
  amountDue: string;
};

function ProductsPricingPanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: products = [], isLoading } = useAdminListProducts();
  const updateProduct = useAdminUpdateProduct();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ price: "", currency: "USD", priceLabel: "" });

  const startEdit = (p: AdminProduct) => {
    setEditingKey(p.productKey);
    setEditState({
      price: p.price != null ? String(p.price) : "",
      currency: p.currency,
      priceLabel: p.priceLabel ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingKey(null);
  };

  const savePrice = (p: AdminProduct, overrideContactUs = false) => {
    const price = overrideContactUs ? null : (editState.price.trim() !== "" ? parseFloat(editState.price) : null);
    const priceLabel = overrideContactUs ? "Contact us for pricing" : (editState.priceLabel.trim() || null);

    updateProduct.mutate(
      {
        productKey: p.productKey,
        data: {
          name: p.name,
          description: p.description,
          price,
          currency: editState.currency.trim() || "USD",
          priceLabel,
          isActive: p.isActive,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
          toast({ title: "Price updated successfully." });
          setEditingKey(null);
        },
        onError: () => {
          toast({ title: "Failed to update price", variant: "destructive" });
        },
      },
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading products...</div>;
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50/50">
        <h2 className="font-medium">Products & Pricing</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage product prices. Changes are reflected immediately on the public site.</p>
      </div>
      <div className="divide-y">
        {products.map((p) => (
          <div key={p.productKey} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">{p.name}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{p.description}</div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-sm">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground mr-1">Display:</span>
                    <span className="font-medium">{p.displayText}</span>
                  </span>
                  {p.price != null && (
                    <span className="text-sm">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground mr-1">Price:</span>
                      <span className="font-mono">{Number(p.price).toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground ml-1">{p.currency}</span>
                    </span>
                  )}
                </div>
              </div>
              {editingKey !== p.productKey && (
                <Button variant="outline" size="sm" onClick={() => startEdit(p)}>
                  Edit Price
                </Button>
              )}
            </div>

            {editingKey === p.productKey && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Price</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 20.00 (leave blank for Contact us)"
                      value={editState.price}
                      onChange={(e) => setEditState((s) => ({ ...s, price: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Currency</label>
                    <Input
                      placeholder="USD"
                      value={editState.currency}
                      onChange={(e) => setEditState((s) => ({ ...s, currency: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Price display label</label>
                    <Input
                      placeholder="e.g. Contact us for pricing"
                      value={editState.priceLabel}
                      onChange={(e) => setEditState((s) => ({ ...s, priceLabel: e.target.value }))}
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">Shown when price is blank.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => savePrice(p)}
                    disabled={updateProduct.isPending}
                  >
                    Save Price
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEdit}
                    disabled={updateProduct.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => savePrice(p, true)}
                    disabled={updateProduct.isPending}
                  >
                    Set as "Contact us for pricing"
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentSettingsPanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: methods = [], isLoading } = useAdminListPaymentMethods();
  const updateMethods = useAdminUpdatePaymentMethods();

  type MethodEdit = {
    methodKey: PaymentMethodKey;
    nameEn: string;
    nameAr: string;
    instructionsEn: string;
    instructionsAr: string;
    isActive: boolean;
  };

  const [edits, setEdits] = useState<Record<string, MethodEdit>>({});
  const [initialized, setInitialized] = useState(false);

  if (!initialized && methods.length > 0) {
    const init: Record<string, MethodEdit> = {};
    for (const m of methods) {
      init[m.methodKey] = {
        methodKey: m.methodKey,
        nameEn: m.nameEn,
        nameAr: m.nameAr,
        instructionsEn: m.instructionsEn,
        instructionsAr: m.instructionsAr,
        isActive: m.isActive,
      };
    }
    setEdits(init);
    setInitialized(true);
  }

  const updateField = (methodKey: string, field: keyof MethodEdit, value: string | boolean) => {
    setEdits((prev) => ({
      ...prev,
      [methodKey]: { ...prev[methodKey]!, [field]: value },
    }));
  };

  const saveMethod = (methodKey: string) => {
    const edit = edits[methodKey];
    if (!edit) return;
    updateMethods.mutate(
      { data: Object.values(edits).map((e) => ({ ...e })) },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListPaymentMethodsQueryKey() });
          toast({ title: "Payment method saved." });
        },
        onError: () => {
          toast({ title: "Failed to save payment method", variant: "destructive" });
        },
      },
    );
  };

  const toggleActive = (methodKey: string) => {
    const current = edits[methodKey]?.isActive ?? false;
    const newEdits = {
      ...edits,
      [methodKey]: { ...edits[methodKey]!, isActive: !current },
    };
    setEdits(newEdits);
    updateMethods.mutate(
      { data: Object.values(newEdits).map((e) => ({ ...e })) },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListPaymentMethodsQueryKey() });
          toast({ title: `Payment method ${!current ? "enabled" : "disabled"}.` });
        },
        onError: () => {
          toast({ title: "Failed to update payment method", variant: "destructive" });
        },
      },
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading payment methods...</div>;
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50/50">
        <h2 className="font-medium">Payment Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enable or disable payment methods and edit their displayed instructions. Active methods appear on the public order form.
        </p>
      </div>
      <div className="divide-y">
        {methods.map((m) => {
          const edit = edits[m.methodKey];
          if (!edit) return null;
          return (
            <div key={m.methodKey} className="p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <div className="font-semibold">{m.nameEn}</div>
                  <div className="text-sm text-muted-foreground font-mono">{m.methodKey}</div>
                </div>
                <button
                  onClick={() => toggleActive(m.methodKey)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    edit.isActive ? "bg-primary" : "bg-gray-200"
                  }`}
                  aria-label={`${edit.isActive ? "Disable" : "Enable"} ${m.nameEn}`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      edit.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name (English)</label>
                  <Input
                    value={edit.nameEn}
                    onChange={(e) => updateField(m.methodKey, "nameEn", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name (Arabic)</label>
                  <Input
                    value={edit.nameAr}
                    onChange={(e) => updateField(m.methodKey, "nameAr", e.target.value)}
                    dir="rtl"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Instructions (English)</label>
                  <Textarea
                    value={edit.instructionsEn}
                    onChange={(e) => updateField(m.methodKey, "instructionsEn", e.target.value)}
                    className="resize-none h-20 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Instructions (Arabic)</label>
                  <Textarea
                    value={edit.instructionsAr}
                    onChange={(e) => updateField(m.methodKey, "instructionsAr", e.target.value)}
                    dir="rtl"
                    className="resize-none h-20 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={() => saveMethod(m.methodKey)}
                  disabled={updateMethods.isPending}
                >
                  Save
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderPaymentPanel({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const { toast } = useToast();
  const updatePayment = useUpdateOrderPayment();
  const [isExpanded, setIsExpanded] = useState(false);
  const [paymentEdit, setPaymentEdit] = useState<PaymentEditState>({
    paymentNote: order.paymentNote ?? "",
    paymentReference: order.paymentReference ?? "",
    amountDue: order.amountDue != null ? String(order.amountDue) : "",
  });

  const handlePaymentStatusChange = (newStatus: PaymentStatus) => {
    updatePayment.mutate(
      { id: order.id, data: { paymentStatus: newStatus } },
      {
        onSuccess: () => {
          toast({ title: "Payment status updated" });
          onUpdate();
        },
        onError: () => {
          toast({ title: "Failed to update payment status", variant: "destructive" });
        },
      },
    );
  };

  const handleSavePaymentDetails = () => {
    updatePayment.mutate(
      {
        id: order.id,
        data: {
          paymentNote: paymentEdit.paymentNote.trim() || null,
          paymentReference: paymentEdit.paymentReference.trim() || null,
          amountDue: paymentEdit.amountDue.trim() !== "" ? parseFloat(paymentEdit.amountDue) : null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Payment details saved" });
          onUpdate();
        },
        onError: () => {
          toast({ title: "Failed to save payment details", variant: "destructive" });
        },
      },
    );
  };

  const statusColor: Record<string, string> = {
    pending: "text-gray-600 bg-gray-100",
    awaiting_confirmation: "text-blue-700 bg-blue-50",
    paid: "text-green-700 bg-green-100",
    failed: "text-red-700 bg-red-50",
    refunded: "text-orange-700 bg-orange-50",
    cancelled: "text-gray-700 bg-gray-100",
  };

  return (
    <div className="border rounded-lg bg-gray-50/50 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-gray-100/50 transition-colors"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <span className="flex items-center gap-2">
          Payment
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
          </span>
          {order.amountDue != null && (
            <span className="text-xs text-muted-foreground font-mono">
              {order.currency} {Number(order.amountDue).toFixed(2)}
            </span>
          )}
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t bg-white">
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Payment Method</div>
              <div className="font-medium">{order.paymentMethod ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Currency</div>
              <div className="font-medium">{order.currency}</div>
            </div>
            {order.paymentReference && (
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Payment Reference</div>
                <div className="font-mono text-sm">{order.paymentReference}</div>
              </div>
            )}
            {order.paidAt && (
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Paid At</div>
                <div className="text-sm">{new Date(order.paidAt).toLocaleString()}</div>
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Update Payment Status</div>
            <div className="flex flex-wrap gap-2">
              {(["awaiting_confirmation", "paid", "failed", "refunded", "cancelled"] as PaymentStatus[]).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={order.paymentStatus === status ? "default" : "outline"}
                  className="h-7 text-xs"
                  disabled={updatePayment.isPending || order.paymentStatus === status}
                  onClick={() => handlePaymentStatusChange(status)}
                >
                  {PAYMENT_STATUS_LABELS[status]}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount Due</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 40.00"
                value={paymentEdit.amountDue}
                onChange={(e) => setPaymentEdit((s) => ({ ...s, amountDue: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Reference</label>
              <Input
                placeholder="e.g. TXN-12345"
                value={paymentEdit.paymentReference}
                onChange={(e) => setPaymentEdit((s) => ({ ...s, paymentReference: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment Note</label>
              <Input
                placeholder="Internal note..."
                value={paymentEdit.paymentNote}
                onChange={(e) => setPaymentEdit((s) => ({ ...s, paymentNote: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleSavePaymentDetails}
            disabled={updatePayment.isPending}
          >
            Save Payment Details
          </Button>
        </div>
      )}
    </div>
  );
}

const TRACKING_STAGE_LABELS: Record<string, string> = {
  order_submitted: "Order Submitted",
  order_reviewed: "Order Reviewed",
  customer_contacted: "Customer Contacted",
  confirmed: "Confirmed",
  preparing_order: "Preparing Order",
  ready_for_pickup: "Ready for Pickup",
  completed: "Completed",
  rejected: "Rejected",
};

const QUICK_ACTION_STAGES: { label: string; stage: TrackingStage; note: string }[] = [
  { label: "Contacted", stage: "customer_contacted", note: "We have reviewed your order and reached out to confirm details." },
  { label: "Confirmed", stage: "confirmed", note: "Your order has been confirmed. We are preparing it for you." },
  { label: "Preparing", stage: "preparing_order", note: "Your order is being prepared and will be ready soon." },
  { label: "Ready", stage: "ready_for_pickup", note: "Your order is ready for pickup or delivery." },
  { label: "Completed", stage: "completed", note: "Your order has been completed. Thank you for choosing Enzora!" },
  { label: "Rejected", stage: "rejected", note: "We were unable to process your order. Please contact us for more information." },
];

function OrderTrackingPanel({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const { toast } = useToast();
  const updateTracking = useUpdateOrderTracking();
  const [isExpanded, setIsExpanded] = useState(false);
  const [trackingNote, setTrackingNote] = useState(order.trackingNote ?? "");
  const [trackingLocation, setTrackingLocation] = useState(order.trackingLocation ?? "");
  const [selectedStage, setSelectedStage] = useState<TrackingStage>(order.trackingStage);

  const handleQuickAction = (stage: TrackingStage, note: string) => {
    updateTracking.mutate(
      { id: order.id, data: { trackingStage: stage, trackingNote: note } },
      {
        onSuccess: () => {
          toast({ title: `Stage updated to: ${TRACKING_STAGE_LABELS[stage]}` });
          onUpdate();
        },
        onError: () => {
          toast({ title: "Failed to update tracking", variant: "destructive" });
        },
      },
    );
  };

  const handleSave = () => {
    updateTracking.mutate(
      {
        id: order.id,
        data: {
          trackingStage: selectedStage,
          trackingNote: trackingNote.trim() || null,
          trackingLocation: trackingLocation.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Tracking details saved" });
          onUpdate();
        },
        onError: () => {
          toast({ title: "Failed to save tracking details", variant: "destructive" });
        },
      },
    );
  };

  const stageColor: Record<string, string> = {
    order_submitted: "bg-gray-100 text-gray-700",
    order_reviewed: "bg-blue-50 text-blue-700",
    customer_contacted: "bg-indigo-50 text-indigo-700",
    confirmed: "bg-violet-50 text-violet-700",
    preparing_order: "bg-amber-50 text-amber-700",
    ready_for_pickup: "bg-orange-50 text-orange-700",
    completed: "bg-green-100 text-green-700",
    rejected: "bg-red-50 text-red-700",
  };

  return (
    <div className="border rounded-lg bg-gray-50/50 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-gray-100/50 transition-colors"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <span className="flex items-center gap-2">
          Tracking
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${stageColor[order.trackingStage] ?? "bg-gray-100 text-gray-600"}`}>
            {TRACKING_STAGE_LABELS[order.trackingStage] ?? order.trackingStage}
          </span>
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t bg-white">
          <div className="pt-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Last updated:</span>{" "}
              {new Date(order.updatedAt).toLocaleString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Quick Actions</div>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTION_STAGES.map(({ label, stage, note }) => (
                <Button
                  key={stage}
                  size="sm"
                  variant={order.trackingStage === stage ? "default" : "outline"}
                  className="h-7 text-xs"
                  disabled={updateTracking.isPending || order.trackingStage === stage}
                  onClick={() => handleQuickAction(stage, note)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom Update</div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stage</label>
              <Select
                value={selectedStage}
                onValueChange={(v) => setSelectedStage(v as TrackingStage)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(TRACKING_STAGE_LABELS) as [TrackingStage, string][]).map(([s, label]) => (
                    <SelectItem key={s} value={s}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer-facing Note</label>
              <Input
                placeholder="Update message shown to customer..."
                value={trackingNote}
                onChange={(e) => setTrackingNote(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location (optional)</label>
              <Input
                placeholder="e.g. Ramallah warehouse"
                value={trackingLocation}
                onChange={(e) => setTrackingLocation(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateTracking.isPending}
            >
              Save Tracking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  const { data: me, isError, isLoading: isMeLoading } = useAdminMe({
    query: {
      retry: false,
      queryKey: getAdminMeQueryKey(),
    }
  });

  useEffect(() => {
    if (isError) {
      clearAdminToken();
      setLocation("/admin/login");
    }
  }, [isError, setLocation]);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");

  const params = {
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(search ? { search } : {})
  };

  const { data: summary } = useGetOrdersSummary();
  const { data: orders = [], isLoading: isOrdersLoading } = useListOrders(params, {
    query: {
      queryKey: getListOrdersQueryKey(params)
    }
  });

  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  if (isMeLoading) return <div className="p-8">Loading...</div>;
  if (isError) return null;

  const handleLogout = () => {
    clearAdminToken();
    setLocation("/admin/login");
  };

  const handleStatusChange = (id: number, newStatus: OrderStatus) => {
    updateStatus.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(params) });
          queryClient.invalidateQueries({ queryKey: getGetOrdersSummaryQueryKey() });
          toast({ title: "Status updated" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteOrder.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(params) });
          queryClient.invalidateQueries({ queryKey: getGetOrdersSummaryQueryKey() });
          toast({ title: "Order deleted" });
        }
      }
    );
  };

  const handlePaymentUpdate = () => {
    queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(params) });
  };

  const handleTrackingUpdate = () => {
    queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(params) });
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 gap-4">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}enzora-logo.png`} alt="Enzora" className="h-9 w-auto" />
          <span className="text-lg font-semibold text-primary hidden sm:inline">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            <SocialIcons variant="onLight" size="sm" />
          </div>
          <Button variant="outline" onClick={handleLogout}>Log out</Button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Orders</div>
            <div className="text-3xl font-semibold">{summary?.total || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">New</div>
            <div className="text-3xl font-semibold">{summary?.byStatus?.new || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Contacted</div>
            <div className="text-3xl font-semibold">{summary?.byStatus?.contacted || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Confirmed</div>
            <div className="text-3xl font-semibold">{summary?.byStatus?.confirmed || 0}</div>
          </div>
        </div>

        <div className="flex gap-1 border-b overflow-x-auto">
          {(["orders", "products", "payment-settings", "settings"] as Tab[]).map((tab) => {
            const labels: Record<Tab, string> = {
              orders: "Orders",
              products: "Products & Pricing",
              "payment-settings": "Payment Settings",
              settings: "Settings",
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h2 className="font-medium">Orders</h2>
                <div className="flex gap-4 w-full sm:w-auto">
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | "all")}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Country / City</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price at Order</TableHead>
                      <TableHead>Est. Total</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isOrdersLoading ? (
                      <TableRow><TableCell colSpan={12} className="text-center py-8">Loading...</TableCell></TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow><TableCell colSpan={12} className="text-center py-8 text-muted-foreground">No orders found</TableCell></TableRow>
                    ) : (
                      orders.map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-xs">{o.orderReference}</TableCell>
                          <TableCell className="whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="font-medium">{o.fullName}</div>
                            <div className="text-xs text-muted-foreground">{o.email}</div>
                            <div className="text-xs text-muted-foreground">{o.phone}</div>
                          </TableCell>
                          <TableCell className="capitalize">{o.customerType}</TableCell>
                          <TableCell>
                            {o.country || o.city ? (
                              <div>
                                {o.country && <div className="font-medium text-sm">{o.country}</div>}
                                {o.city && <div className="text-xs text-muted-foreground">{o.city}</div>}
                              </div>
                            ) : (
                              <span className="text-sm">{o.countryCity || "—"}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">
                              {o.productNameSnapshot ?? productLabel(o.productSelection)}
                            </div>
                          </TableCell>
                          <TableCell>{o.quantity}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {o.productPriceSnapshot != null
                              ? `${o.productCurrencySnapshot ?? "USD"} ${Number(o.productPriceSnapshot).toFixed(2)}`
                              : <span className="text-xs text-muted-foreground">Contact us</span>}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {o.totalEstimatedPrice != null
                              ? `${o.productCurrencySnapshot ?? "USD"} ${Number(o.totalEstimatedPrice).toFixed(2)}`
                              : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            {o.message ? (
                              <div className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{o.message}</div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select value={o.status} onValueChange={(v) => handleStatusChange(o.id, v as OrderStatus)}>
                              <SelectTrigger className="h-8 w-[120px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive h-8 px-2">Delete</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete order?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete order {o.orderReference}? This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(o.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Payment panels for each order */}
            {!isOrdersLoading && orders.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50">
                  <h2 className="font-medium">Payment Details</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Click an order to view and manage payment status and details.</p>
                </div>
                <div className="divide-y">
                  {orders.map((o) => (
                    <div key={o.id} className="px-4 py-3">
                      <div className="text-xs text-muted-foreground font-mono mb-2">{o.orderReference} — {o.fullName}</div>
                      <OrderPaymentPanel order={o} onUpdate={handlePaymentUpdate} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracking panels for each order */}
            {!isOrdersLoading && orders.length > 0 && (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50">
                  <h2 className="font-medium">Order Tracking</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Update the customer-facing tracking stage and notes for each order.</p>
                </div>
                <div className="divide-y">
                  {orders.map((o) => (
                    <div key={o.id} className="px-4 py-3">
                      <div className="text-xs text-muted-foreground font-mono mb-2">{o.orderReference} — {o.fullName}</div>
                      <OrderTrackingPanel order={o} onUpdate={handleTrackingUpdate} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && <ProductsPricingPanel />}

        {activeTab === "payment-settings" && <PaymentSettingsPanel />}

        {activeTab === "settings" && (
          <SocialLinksEditor />
        )}
      </main>
    </div>
  );
}
