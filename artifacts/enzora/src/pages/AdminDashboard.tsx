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
  getListOrdersQueryKey,
  getGetOrdersSummaryQueryKey,
  useAdminListProducts,
  getAdminListProductsQueryKey,
  useAdminUpdateProduct,
  type AdminProduct,
} from "@workspace/api-client-react";
import { clearAdminToken } from "@/lib/auth-fetch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { SocialIcons } from "@/components/SocialIcons";
import { SocialLinksEditor } from "@/components/SocialLinksEditor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const productLabel = (p?: string | null) => {
  switch (p) {
    case "bandage_pack": return "Enzora Bandage Pack";
    case "smart_device": return "Enzora Smart Device";
    case "complete_package": return "Complete Enzora Package";
    default: return p ?? "—";
  }
};

type Tab = "orders" | "products" | "settings";

type EditState = {
  price: string;
  currency: string;
  priceLabel: string;
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

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const params = {
    ...(statusFilter !== "all" ? { status: statusFilter as any } : {}),
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

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatus.mutate(
      { id, data: { status: newStatus as any } },
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

        <div className="flex gap-1 border-b">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "products" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Products & Pricing
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "settings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Settings
          </button>
        </div>

        {activeTab === "orders" && (
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                          <Select value={o.status} onValueChange={(v) => handleStatusChange(o.id, v)}>
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
        )}

        {activeTab === "products" && <ProductsPricingPanel />}

        {activeTab === "settings" && (
          <SocialLinksEditor />
        )}
      </main>
    </div>
  );
}
