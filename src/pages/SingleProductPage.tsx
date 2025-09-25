import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, ShoppingCart } from "lucide-react";
import { Product, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const SingleProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Xatolik",
        description: "Mahsulot ma'lumotlarini yuklashda xatolik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast({
      title: "Savatga qo'shildi",
      description: `${product.name} savatga qo'shildi`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="bg-muted rounded-lg h-64 w-64"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Mahsulot topilmadi</h2>
          <Button onClick={() => navigate("/")}>Asosiy sahifaga qaytish</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground text-lg">
                {product.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                {product.price.toLocaleString()} so'm
              </span>
              {product.is_available ? (
                <Badge variant="outline" className="text-green-600">
                  Mavjud
                </Badge>
              ) : (
                <Badge variant="destructive">Mavjud emas</Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Tayyorlash vaqti: {product.preparation_time} daqiqa</span>
            </div>

            <Button
              onClick={addToCart}
              className="w-full md:w-auto"
              disabled={!product.is_available}
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Savatga qo'shish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;
