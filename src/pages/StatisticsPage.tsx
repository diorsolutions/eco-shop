import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Clock,
  DollarSign,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";

const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    averagePreparationTime: 0,
  });

  const [ordersByStatus, setOrdersByStatus] = useState([
    { name: "Yangi", value: 0, color: "#8884d8" },
    { name: "Tasdiqlangan", value: 0, color: "#82ca9d" },
    { name: "Tugallangan", value: 0, color: "#ffc658" },
    { name: "Bekor qilingan", value: 0, color: "#ff7300" },
  ]);

  const [dailyOrders, setDailyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch all orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*");

      if (ordersError) throw ordersError;

      // Calculate basic stats
      const totalOrders = orders?.length || 0;
      const totalRevenue =
        orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const uniqueCustomers = new Set(
        orders?.map((order) => order.customer_phone)
      ).size;

      // Fetch products for average preparation time
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("preparation_time");

      if (productsError) throw productsError;

      const averagePreparationTime =
        products?.length > 0
          ? products.reduce(
              (sum, product) => sum + product.preparation_time,
              0
            ) / products.length
          : 0;

      setStats({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        totalCustomers: uniqueCustomers,
        averagePreparationTime,
      });

      // Calculate orders by status
      const statusCounts = {
        new: orders?.filter((order) => order.status === "new").length || 0,
        confirmed:
          orders?.filter((order) => order.status === "confirmed").length || 0,
        completed:
          orders?.filter((order) => order.status === "completed").length || 0,
        cancelled:
          orders?.filter((order) => order.status === "cancelled").length || 0,
      };

      setOrdersByStatus([
        { name: "Yangi", value: statusCounts.new, color: "#3b82f6" },
        {
          name: "Tasdiqlangan",
          value: statusCounts.confirmed,
          color: "#10b981",
        },
        {
          name: "Tugallangan",
          value: statusCounts.completed,
          color: "#f59e0b",
        },
        {
          name: "Bekor qilingan",
          value: statusCounts.cancelled,
          color: "#ef4444",
        },
      ]);

      // Calculate daily orders for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      }).reverse();

      const dailyOrdersData = last7Days.map((date) => ({
        date: new Date(date).toLocaleDateString("uz-UZ", {
          month: "short",
          day: "numeric",
        }),
        orders:
          orders?.filter((order) => order.created_at.split("T")[0] === date)
            .length || 0,
      }));

      setDailyOrders(dailyOrdersData as any);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast({
        title: "Xatolik",
        description: "Statistika ma'lumotlarini yuklashda xatolik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Statistika</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Statistika</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jami buyurtmalar
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <Badge variant="outline" className="mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Barcha vaqt
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jami daromad
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRevenue.toLocaleString()} so'm
              </div>
              <p className="text-xs text-muted-foreground">
                Barcha buyurtmalar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                O'rtacha buyurtma
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageOrderValue.toLocaleString()} so'm
              </div>
              <p className="text-xs text-muted-foreground">Har bir buyurtma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mijozlar</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Noyob telefon raqamlari
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                O'rtacha tayyorlash
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stats.averagePreparationTime)} daq
              </div>
              <p className="text-xs text-muted-foreground">
                Barcha mahsulotlar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>So'nggi 7 kunlik buyurtmalar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders by Status Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Buyurtmalar holati bo'yicha</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StatisticsPage;
