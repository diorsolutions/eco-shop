import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UtensilsCrossed } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ChatSystem from "@/components/ChatSystem";
import CartDrawer from "@/components/CartDrawer";
import { Product, Category, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { v4 as uuidv4 } from "uuid";
import { useMessages } from "@/hooks/useMessages";

const RestaurantOrder: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const { addToCart } = useCart();
  const { messages, addMessage } = useMessages();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("name");

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Xatolik",
        description: "Ma'lumotlarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category_id === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Savatga qo'shildi",
      description: `${product.name} savatga qo'shildi`,
    });
  };

  const handleSubmitOrder = async (orderData: {
    cart?: any[];
    customerInfo: { name: string; phone: string };
    location: string;
  }) => {
    try {
      if (!orderData.cart || orderData.cart.length === 0) return;

      const orderId = uuidv4();
      const totalAmount = orderData.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Create order
      const { error: orderError } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: orderData.customerInfo.name,
        customer_phone: orderData.customerInfo.phone,
        customer_location: orderData.location,
        status: "pending",
        total_amount: totalAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.cart.map((item) => ({
        id: uuidv4(),
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        created_at: new Date().toISOString(),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Add system message for customer
      const productNames = orderData.cart
        .map((item) => `${item.name} (${item.quantity}x)`)
        .join(", ");
      const messageText = `Sizning [${productNames}] nomli buyurtmangiz muvaffaqiyatli qabul qilindi. Endi tasdiqlanishini kuting. Tasdiqlansa buyurtmangiz allaqachon tayyorlanib kurier orqali jo'natilganligini anglatadi.`;

      addMessage(messageText, orderId);

      toast({
        title: "Buyurtma qabul qilindi!",
        description: "Buyurtmangiz muvaffaqiyatli yuborildi",
      });
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Xatolik",
        description: "Buyurtmani yuborishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary rounded-full">
                <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Minimalist Restaurant
                </h1>
                <p className="text-muted-foreground">
                  Eng mazali taomlar, oddiy buyurtma
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Taom qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                size="sm"
              >
                Barchasi
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Hech narsa topilmadi</h3>
            <p className="text-muted-foreground">
              Boshqa kategoriya yoki qidiruv so'zini sinab ko'ring
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <Badge variant="outline" className="text-sm">
                {filteredProducts.length} ta taom topildi
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Cart Drawer */}
      <div className="fixed top-4 right-4 z-50">
        <CartDrawer onOrderSubmit={handleSubmitOrder} />
      </div>

      {/* Chat System */}
      <ChatSystem
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        messages={messages}
      />
    </div>
  );
};

export default RestaurantOrder;
