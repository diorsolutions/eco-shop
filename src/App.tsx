import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RestaurantOrder from "./pages/RestaurantOrder";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLogin from "./pages/AdminLogin";
import SingleProductPage from "./pages/SingleProductPage";
import ProductsManagement from "./pages/ProductsManagement";
import StatisticsPage from "./pages/StatisticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RestaurantOrder />} />
          <Route path="/product/:id" element={<SingleProductPage />} />
          <Route path="/dashboard" element={<AdminLogin />} />
          <Route path="/dashboard/orders" element={<AdminDashboardPage />} />
          <Route path="/dashboard/products" element={<ProductsManagement />} />
          <Route path="/dashboard/statistics" element={<StatisticsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
