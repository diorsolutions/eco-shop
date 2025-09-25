import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash2, MoreVertical } from "lucide-react";
import { Product, Category, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";

const ProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    preparation_time: 15,
    image_url: "/placeholder.svg",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from("products").select("*").order("name"),
        supabase.from("categories").select("*").order("name"),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update({
            ...newProduct,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({
          title: "Muvaffaqiyat",
          description: "Mahsulot yangilandi",
        });
      } else {
        const { error } = await supabase.from("products").insert({
          ...newProduct,
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: "Muvaffaqiyat",
          description: "Yangi mahsulot qo'shildi",
        });
      }

      setIsAddModalOpen(false);
      setEditingProduct(null);
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        category_id: "",
        preparation_time: 15,
        image_url: "/placeholder.svg",
      });
      fetchData();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Xatolik",
        description: "Mahsulotni saqlashda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id || "",
      preparation_time: product.preparation_time,
      image_url: product.image_url || "/placeholder.svg",
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Muvaffaqiyat",
        description: "Mahsulot o'chirildi",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Xatolik",
        description: "Mahsulotni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          is_available: !product.is_available,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (error) throw error;

      toast({
        title: "Muvaffaqiyat",
        description: `Mahsulot ${
          !product.is_available ? "faollashtirildi" : "faolsizlashtirildi"
        }`,
      });

      fetchData();
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({
        title: "Xatolik",
        description: "Mahsulot holatini o'zgartirishda xatolik",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mahsulotlar</h1>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({
                    name: "",
                    description: "",
                    price: 0,
                    category_id: "",
                    preparation_time: 15,
                    image_url: "/placeholder.svg",
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Yangi mahsulot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct
                    ? "Mahsulotni tahrirlash"
                    : "Yangi mahsulot qo'shish"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Mahsulot nomi"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="Tavsif"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  placeholder="Narx"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                  required
                />
                <Input
                  placeholder="Tayyorlash vaqti (daqiqa)"
                  type="number"
                  value={newProduct.preparation_time}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      preparation_time: parseInt(e.target.value),
                    })
                  }
                  required
                />
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={newProduct.category_id}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      category_id: e.target.value,
                    })
                  }
                >
                  <option value="">Kategoriya tanlang</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Bekor qilish
                  </Button>
                  <Button type="submit">
                    {editingProduct ? "Yangilash" : "Qo'shish"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader className="relative">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(product)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleAvailability(product)}
                      >
                        {product.is_available
                          ? "Faolsizlashtirish"
                          : "Faollashtirish"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        O'chirish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-3">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold text-primary">
                      {product.price.toLocaleString()} so'm
                    </span>
                    <Badge
                      variant={product.is_available ? "outline" : "destructive"}
                    >
                      {product.is_available ? "Mavjud" : "Mavjud emas"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tayyorlash: {product.preparation_time} daqiqa
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductsManagement;
