import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminRepository } from "@/repositories";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/panel/orders")({
  component: OrdersPage,
});

const STATUSES = ["new", "preparing", "delivered", "cancelled"] as const;
const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  preparing: "Hazırlanıyor",
  delivered: "Teslim edildi",
  cancelled: "İptal",
};

function OrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders = [], isPending } = useQuery({
    queryKey: ["panel", "orders"],
    queryFn: () => adminRepository.orders(),
    refetchInterval: 30_000,
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminRepository.setOrderStatus(id, status),
    onSuccess: async () => {
      toast.success("Sipariş durumu güncellendi");
      await queryClient.invalidateQueries({ queryKey: ["panel", "orders"] });
    },
    onError: () => toast.error("Güncelleme başarısız"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Siparişler</h1>
        <p className="mt-1 text-sm text-muted-foreground">QR menüden gelen siparişleri takip edin ve durumlarını güncelleyin.</p>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : orders.length === 0 ? (
        <p className="surface-card p-6 text-sm text-muted-foreground">Henüz sipariş yok.</p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {orders.map((order) => (
            <li key={order.id} className="surface-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    #{order.code}
                    {order.table_no ? ` · Masa ${order.table_no}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer_name} · {order.customer_phone}
                  </p>
                </div>
                <Select value={order.status} onValueChange={(status) => setStatus.mutate({ id: order.id, status })}>
                  <SelectTrigger className="w-40" aria-label="Sipariş durumu">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {(order.order_items ?? []).map((item, index) => (
                  <li key={`${order.id}-${index}`} className="flex justify-between">
                    <span>
                      {item.item_name} × {item.quantity}
                    </span>
                    <span>{formatMoney(Number(item.unit_price) * item.quantity, order.currency)}</span>
                  </li>
                ))}
              </ul>
              <p className="flex justify-between border-t border-border/60 pt-3 font-semibold">
                <span>Toplam</span>
                <span>{formatMoney(order.total, order.currency)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
