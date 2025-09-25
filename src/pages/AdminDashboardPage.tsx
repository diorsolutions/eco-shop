import React, { useState } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import AdminLayout from "@/components/AdminLayout";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: "system" | "customer";
}

const AdminDashboardPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (text: string, phone: string) => {
    // In a real application, you would integrate with an SMS API here
    console.log(`Sending message to ${phone}: ${text}`);
    
    // For demonstration, we'll show an alert
    alert(`Sending message to ${phone}: ${text}`);
    
    // In a real app, you might have an SMS service integration like:
    // await fetch('/api/send-sms', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ phone, message: text }),
    // });

    const newMessage: Message = {
      id: uuidv4(),
      text: `Yuborildi (${phone}): ${text}`,
      timestamp: new Date(),
      type: "system",
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <AdminLayout>
      <AdminDashboard onSendMessage={handleSendMessage} />
    </AdminLayout>
  );
};

export default AdminDashboardPage;