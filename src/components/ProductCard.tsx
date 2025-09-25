import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Eye } from "lucide-react";
import { Product } from "@/lib/supabase";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-secondary/50 border-0 overflow-hidden">
      <div className="aspect-square bg-muted overflow-hidden">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors hover:underline">
              {product.name}
            </h3>
          </Link>
          {!product.is_available && (
            <Badge variant="destructive" className="ml-2">
              Mavjud emas
            </Badge>
          )}
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-muted-foreground text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {product.preparation_time} min
          </div>
          <div className="text-2xl font-bold text-primary">
            {product.price.toLocaleString()} so'm
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Link to={`/product/${product.id}`} className="flex-1">
          <Button variant="outline" className="w-full" size="lg">
            <Eye className="w-4 h-4 mr-2" />
            Ko'rish
          </Button>
        </Link>
        <Button
          onClick={() => onAddToCart(product)}
          disabled={!product.is_available}
          className="flex-1 group-hover:scale-105 transition-transform"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Savatga qo'shish
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
