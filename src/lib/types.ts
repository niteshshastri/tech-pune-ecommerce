export type Spec = { label: string; value: string };

export type StockState = "unverified" | "in_stock" | "out_of_stock";
export type ProductCondition = "new" | "refurbished" | "used";

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  brand: string | null;
  condition: ProductCondition;
  category_id: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  price: number;
  compare_at_price: number | null;
  warranty: string | null;
  specs: Spec[];
  stock_quantity: number;
  stock_state: StockState;
  is_featured: boolean;
  is_bestseller: boolean;
  image_url: string | null;
  images?: { id: string; url: string; alt_text: string | null }[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  is_archived: boolean;
};

export type BusinessSettings = {
  id: string;
  business_name: string;
  tagline: string | null;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  google_maps_url: string | null;
  business_hours: string | null;
  gst_number: string | null;
  upi_id: string | null;
  upi_payee_name: string | null;
  upi_qr_url: string | null;
  delivery_fee: number;
  delivery_policy: string | null;
  warranty_policy: string | null;
  refund_policy: string | null;
  cancellation_policy: string | null;
  privacy_policy: string | null;
  terms: string | null;
  about_text: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
};

export type CartLine = { productId: string; quantity: number };

export type OrderItem = {
  id: string;
  product_name: string;
  product_slug: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type OrderRecord = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: string;
  order_status: string;
  upi_reference: string | null;
  admin_notes: string | null;
  created_at: string;
  items: OrderItem[];
};
