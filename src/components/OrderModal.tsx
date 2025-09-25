import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MapPin, User, Phone, Clock, AlertTriangle } from "lucide-react";
import { Product } from "@/lib/supabase";
import { useGeolocation } from "@/hooks/useGeolocation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/hooks/useCart";

interface CustomerInfo {
  name: string;
  phone: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  cart?: CartItem[];
  onSubmitOrder: (orderData: {
    product?: Product;
    cart?: CartItem[];
    customerInfo: CustomerInfo;
    location: string;
  }) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  product,
  cart,
  onSubmitOrder,
}) => {
  const [customerInfo, setCustomerInfo] = useLocalStorage<CustomerInfo>(
    "customerInfo",
    {
      name: "",
      phone: "",
    }
  );

  const [manualLocation, setManualLocation] = useState("");
  const [locationMethod, setLocationMethod] = useState<"manual" | "auto">(
    "manual"
  );
  const [showLocationAlert, setShowLocationAlert] = useState(false);

  const { location, loading, error, getCurrentLocation, clearLocation } =
    useGeolocation();
  const { toast } = useToast();

  useEffect(() => {
    if (error && locationMethod === "auto") {
      setShowLocationAlert(true);
    }
  }, [error, locationMethod]);

  useEffect(() => {
    if (location && locationMethod === "auto") {
      setShowLocationAlert(false);
    }
  }, [location, locationMethod]);

  const handleLocationMethodChange = (method: "manual" | "auto") => {
    setLocationMethod(method);
    if (method === "auto") {
      getCurrentLocation();
    } else {
      clearLocation();
    }
  };

  const handleLocationPermissionRequest = () => {
    setShowLocationAlert(false);
    getCurrentLocation();
  };

  const handleLocationPermissionDeny = () => {
    setShowLocationAlert(false);
    setLocationMethod("manual");
  };

  const handleSubmit = () => {
    if (!product && (!cart || cart.length === 0)) return;

    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      toast({
        title: "Ma'lumotlar to'liq emas",
        description: "Iltimos, ism va telefon raqamini kiriting",
        variant: "destructive",
      });
      return;
    }

    const finalLocation =
      locationMethod === "auto"
        ? location?.address || `${location?.latitude}, ${location?.longitude}`
        : manualLocation.trim();

    if (!finalLocation) {
      toast({
        title: "Joylashuv ko'rsatilmagan",
        description: "Iltimos, joylashuvingizni kiriting",
        variant: "destructive",
      });
      return;
    }

    onSubmitOrder({
      product,
      cart,
      customerInfo,
      location: finalLocation,
    });

    // Reset location after order
    setManualLocation("");
    clearLocation();
    onClose();
  };

  if (!product && (!cart || cart.length === 0)) return null;

  const displayItems =
    cart && cart.length > 0 ? cart : product ? [product] : [];
  const totalPrice =
    cart && cart.length > 0
      ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      : product?.price || 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Buyurtmani tasdiqlash</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Details */}
            <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-lg">Buyurtma tafsilotlari</h3>
              {displayItems.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {cart && item.quantity && (
                      <p className="text-sm text-muted-foreground">
                        Miqdor: {item.quantity}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {cart && item.quantity
                        ? (item.price * item.quantity).toLocaleString()
                        : item.price.toLocaleString()}{" "}
                      so'm
                    </p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Jami:</span>
                  <span className="text-xl font-bold text-primary">
                    {totalPrice.toLocaleString()} so'm
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Ismingiz
                </Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                  placeholder="To'liq ismingizni kiriting"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Telefon raqam
                </Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
                  }
                  placeholder="+998 XX XXX XX XX"
                />
              </div>

              {/* Location Selection */}
              <div className="space-y-3">
                <Label className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Joylashuv
                </Label>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={
                      locationMethod === "manual" ? "default" : "outline"
                    }
                    onClick={() => handleLocationMethodChange("manual")}
                    className="w-full"
                  >
                    Qo'lda kiritish
                  </Button>
                  <Button
                    type="button"
                    variant={locationMethod === "auto" ? "default" : "outline"}
                    onClick={() => handleLocationMethodChange("auto")}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Aniqlanmoqda..." : "Avtomatik aniqlash"}
                  </Button>
                </div>

                {locationMethod === "manual" && (
                  <Textarea
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="Manzilingizni yozing..."
                    className="min-h-[80px]"
                  />
                )}

                {locationMethod === "auto" && location && (
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <p className="text-sm text-foreground">
                      {location.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button onClick={handleSubmit}>Buyurtma berish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Permission Alert */}
      <AlertDialog open={showLocationAlert} onOpenChange={setShowLocationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
              Joylashuv ruxsati kerak
            </AlertDialogTitle>
            <AlertDialogDescription>
              Iltimos, manzilingizni avtomatik aniqlashimiz uchun joylashuvga
              ruxsat bering.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLocationPermissionDeny}>
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLocationPermissionRequest}>
              Ruxsat berish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrderModal;
