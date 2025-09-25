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

    // 修改：将 status 改为符合数据库约束的值，例如 'pending'
    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      customer_name: orderData.customerInfo.name,
      customer_phone: orderData.customerInfo.phone,
      customer_location: orderData.location,
      status: "pending", // ✅ 使用合法状态值
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
    const newMessage: Message = {
      id: uuidv4(),
      text: `Sizning [${productNames}] nomli buyurtmangiz muvaffaqiyatli qabul qilindi. Endi tasdiqlanishini kuting. Tasdiqlansa buyurtmangiz allaqachon tayyorlanib kurier orqali jo'natilganligini anglatadi.`,
      timestamp: new Date(),
      type: "system",
    };

    setMessages((prev) => [...prev, newMessage]);

    toast({
      title: "Buyurtma qabul qilindi!",
      description: "Buyurtmangiz muvaffaqiyatli yuborildi",
    });
  } catch (error) {
    console.error("Error submitting order:", error);
    toast({
      title: "Xatolik",
      description:
        "Buyurtmani yuborishda xatolik yuz berdi: " + (error as any).message,
      variant: "destructive",
    });
  }
};
