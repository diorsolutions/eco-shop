import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import OrderModal from "./OrderModal";

interface CartDrawerProps {
  onOrderSubmit: (orderData: any) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderSubmit }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [localCartItems, setLocalCartItems] = useState(cart);
  const [localTotalItems, setLocalTotalItems] = useState(getTotalItems());
  const [localTotalPrice, setLocalTotalPrice] = useState(getTotalPrice());

  // Update local state when cart changes
  useEffect(() => {
    setLocalCartItems(cart);
    setLocalTotalItems(getTotalItems());
    setLocalTotalPrice(getTotalPrice());
  }, [cart, getTotalItems, getTotalPrice]);

  const handleOrderSubmit = (orderData: any) => {
    onOrderSubmit({ ...orderData, cart: localCartItems });
    clearCart();
    setIsCartOpen(false);
    setIsOrderModalOpen(false);
  };

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Savat
            {getTotalItems() > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Savatcha ({getTotalItems()} ta)
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Savatcha bo'sh</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toLocaleString()} so'm
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium px-2">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Jami:</span>
                    <span className="text-xl font-bold text-primary">
                      {getTotalPrice().toLocaleString()} so'm
                    </span>
                  </div>
                  <Button
                    onClick={() => setIsOrderModalOpen(true)}
                    className="w-full"
                    disabled={cart.length === 0}
                  >
                    Buyurtma berish
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cart={cart}
        onSubmitOrder={handleOrderSubmit}
      />
    </>
  );
};

export default CartDrawer;