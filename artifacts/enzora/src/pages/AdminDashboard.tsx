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
} from "@workspace/api-client-react";
import { clearAdminToken } from "@/lib/auth-fetch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const productLabel = (p?: string | null) => {
  switch (p) {
    case "bandage": return "Bandage Pack";
    case "device": return "Smart Device";
    case "kit": return "Complete Package";
    default: return p ?? "—";
  }
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}enzora-logo.png`} alt="Enzora" className="h-9 w-auto" />
          <span className="text-lg font-semibold text-primary hidden sm:inline">Admin</span>
        </div>
        <Button variant="outline" onClick={handleLogout}>Log out</Button>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
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
                  <TableHead>Location</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isOrdersLoading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : orders.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No orders found</TableCell></TableRow>
                ) : (
                  orders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.reference}</TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="font-medium">{o.fullName}</div>
                        <div className="text-xs text-muted-foreground">{o.email}</div>
                      </TableCell>
                      <TableCell className="capitalize">{o.customerType}</TableCell>
                      <TableCell>{o.location}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{productLabel(o.productSelection)}</div>
                        {o.productSelection === "bandage" && (
                          <div className="text-xs text-muted-foreground">5 bandages / pack</div>
                        )}
                      </TableCell>
                      <TableCell>{o.quantity}</TableCell>
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
                                Are you sure you want to delete order {o.reference}? This cannot be undone.
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
      </main>
    </div>
  );
}
