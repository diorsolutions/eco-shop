import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UtensilsCrossed,
  ShoppingCart,
  Settings,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-primary rounded-full shadow-lg">
              <UtensilsCrossed className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            Minimalist Restaurant
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Oddiy, tez va qulay online buyurtma tizimi. Sevimli taomlaringizni
            bir klik bilan buyurtma qiling.
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-secondary/30">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Mijozlar uchun</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Taomlarni ko'rish, buyurtma berish va joylashuvni avtomatik
                aniqlash imkoniyati
              </p>
              <Link to="/order">
                <Button
                  className="w-full group-hover:scale-105 transition-transform"
                  size="lg"
                >
                  Buyurtma berish
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-secondary/30">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Buyurtmalarni boshqarish, status o'zgartirish va real-time
                bildirishnomalar
              </p>
              <Link to="/admin">
                <Button
                  variant="outline"
                  className="w-full group-hover:scale-105 transition-transform"
                  size="lg"
                >
                  Admin Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-8">Tizim imkoniyatlari</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="w-2 h-2 bg-primary rounded-full mx-auto"></div>
              <h3 className="font-medium">Real-time buyurtmalar</h3>
              <p className="text-sm text-muted-foreground">
                Yangi buyurtmalar darhol dashboard da ko'rinadi
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-2 h-2 bg-primary rounded-full mx-auto"></div>
              <h3 className="font-medium">Avtomatik joylashuv</h3>
              <p className="text-sm text-muted-foreground">
                GPS orqali mijozning manzilini aniqlash
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-2 h-2 bg-primary rounded-full mx-auto"></div>
              <h3 className="font-medium">SMS xabarnomalar</h3>
              <p className="text-sm text-muted-foreground">
                Buyurtma holati haqida avtomatik xabarlar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
