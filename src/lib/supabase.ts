import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jujfitoxfwamtmogmrek.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1amZpdG94ZndhbXRtb2dtcmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTMwOTAsImV4cCI6MjA3NDIyOTA5MH0.NTkCt0hrD126zL_8wrSW4AWpdtSp4hWqu94r01-uc4c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_available: boolean;
  preparation_time: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_location: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}
