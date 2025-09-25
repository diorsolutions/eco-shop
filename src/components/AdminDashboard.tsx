import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Clock,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import { Order, OrderItem, Product, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";

interface OrderWithItems extends Order {
  order_items: (OrderItem & { products: Product })[];
}

interface AdminDashboardProps {
  onSendMessage: (message: string, phone: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSendMessage }) => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addMessage } = useMessages();

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("New order notification:", payload);
          // Play notification sound
          // TODO: Add path to notification.mp3 file
          // const audio = new Audio('/notification.mp3');
          // audio.play().catch(console.error);

          fetchOrders();

          if (payload.eventType === "INSERT") {
            toast({
              title: "Yangi buyurtma!",
              description: "Yangi buyurtma keldi",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (*)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Xatolik",
        description: "Buyurtmalarni yuklashda xatolik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      // Find the order to get customer info
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        let message = "";
        const productNames = order.order_items
          .map((item) => item.products.name)
          .join(", ");

        switch (status) {
          case "confirmed":
            message = `Buyurtmangiz tayyor, kurier allaqachon yo'lda`;
            break;
          case "cancelled":
            message = `Buyurtmangiz bekor qilindi, sababini bilish uchun +998907254546 raqamiga qo'ng'iroq qiling`;
            break;
        }

        if (message) {
          // Add system message to customer's chat
          addMessage(message, orderId);
          onSendMessage(message, order.customer_phone);
        }
      }

      await fetchOrders();

      toast({
        title: "Muvaffaqiyat",
        description: "Buyurtma holati yangilandi",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Xatolik",
        description: "Buyurtma holatini yangilashda xatolik",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="default" className="bg-amber-500">
            Kutilmoqda
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-500">
            Tasdiqlangan
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Bekor qilingan</Badge>;
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            Tugallangan
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <Package className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          {orders.length} buyurtma
        </Badge>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Hozircha buyurtmalar yo'q
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card
              key={order.id}
              className={`transition-all duration-300 ${
                order.status === "cancelled" || order.status === "completed"
                  ? "opacity-70"
                  : "opacity-100"
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2">Buyurtma #{order.id.slice(-8)}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {order.status === "pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order.id, "confirmed")
                              }
                              className="cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Tasdiqlash
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order.id, "cancelled")
                              }
                              className="cursor-pointer"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Bekor qilish
                            </DropdownMenuItem>
                          </>
                        )}
                        {order.status === "confirmed" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order.id, "completed")
                              }
                              className="cursor-pointer"
                            >
                              <Package className="w-4 h-4 mr-2" />
                              Tugallangan
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateOrderStatus(order.id, "cancelled")
                              }
                              className="cursor-pointer"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Bekor qilish
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="font-medium mr-2">
                      {order.customer_name}
                    </span>
                    <span className="text-muted-foreground">
                      {order.customer_phone}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    {new Date(order.created_at).toLocaleString("uz-UZ")}
                  </div>
                </div>

                <div className="flex items-start text-sm">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>{order.customer_location}</span>
                </div>

                {/* Order Items */}
                <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">
                    Buyurtma tafsilotlari:
                  </h4>
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>
                        {item.products.name} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        {(item.price * item.quantity).toLocaleString()} so'm
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between items-center font-semibold">
                    <span>Jami:</span>
                    <span className="text-primary">
                      {order.total_amount.toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
