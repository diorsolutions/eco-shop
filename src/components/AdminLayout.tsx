import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  BarChart3,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/dashboard");
  };

  const menuItems = [
    { title: "Buyurtmalar", url: "/dashboard/orders", icon: ShoppingCart },
    { title: "Mahsulotlar", url: "/dashboard/products", icon: Package },
    { title: "Statistika", url: "/dashboard/statistics", icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-2 py-4">
              <div className="p-2 bg-primary rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">
                  Boshqaruv paneli
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menyu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink
                          to={item.url}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="mt-auto p-4 border-t">
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center px-4 gap-2">
            <SidebarTrigger />
            <h1 className="font-semibold">Minimalist Restaurant - Admin</h1>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
