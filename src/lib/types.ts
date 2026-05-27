export type Category =
  | "tabaco"
  | "seda"
  | "isqueiro"
  | "cuia"
  | "piteira"
  | "filtro"
  | "acessorios";

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "tabaco", label: "Tabaco" },
  { value: "seda", label: "Seda" },
  { value: "isqueiro", label: "Isqueiro" },
  { value: "cuia", label: "Cuia" },
  { value: "piteira", label: "Piteira" },
  { value: "filtro", label: "Filtro" },
  { value: "acessorios", label: "Acessórios" },
];

export const CATEGORY_LABEL: Record<Category, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
) as Record<Category, string>;

export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: Category;
  price_cents: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  birth_date: string;
  role: "customer" | "admin";
};

export type OrderStatus = "em_aberto" | "entregue" | "cancelado";
export type PaymentMethod = "pix" | "entrega";

export type Order = {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  payment_method: PaymentMethod;
  shipping_cents: number;
  subtotal_cents: number;
  total_cents: number;
  status: OrderStatus;
  customer_confirmed: boolean;
  notes: string | null;
  created_at: string;
  closed_at: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
};

export type Settings = {
  id: number;
  shop_name: string;
  whatsapp_number: string;
  pix_key: string;
  pix_holder: string;
  shipping_fee_cents: number;
  free_shipping_threshold_cents: number;
};
