import { useState, useEffect } from "react";

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: "system" | "customer";
  orderId?: string;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const savedMessages = localStorage.getItem("customerMessages");
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      // Convert timestamp strings back to Date objects
      const messagesWithDates = parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(messagesWithDates);
    }
  }, []);

  const addMessage = (text: string, orderId?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      type: "system",
      orderId,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem("customerMessages", JSON.stringify(updatedMessages));

    return newMessage;
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem("customerMessages");
  };

  return {
    messages,
    addMessage,
    clearMessages,
  };
};
