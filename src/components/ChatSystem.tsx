import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: "system" | "customer";
}

interface ChatSystemProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: Message[];
}

const ChatSystem: React.FC<ChatSystemProps> = ({
  isOpen,
  onToggle,
  messages,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      // Count unread messages (simple implementation)
      setUnreadCount(messages.length);
    } else {
      setUnreadCount(0);
    }
  }, [isOpen, messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={onToggle}
          className="relative rounded-full w-14 h-14 shadow-lg hover:scale-110 transition-transform"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {isOpen && (
        <Card className="w-80 h-96 shadow-xl border-2 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Xabarlar</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-72 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Hozircha xabarlar yo'q
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.type === "system"
                        ? "bg-primary text-primary-foreground ml-2"
                        : "bg-secondary text-secondary-foreground mr-2"
                    }`}
                  >
                    <p className="text-sm mb-1">{message.text}</p>
                    <p className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatSystem;
