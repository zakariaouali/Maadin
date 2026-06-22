# MAADIN Marketplace - Phase 4: Next.js Frontend Architecture

**Status**: 🟡 ARCHITECTURE & PLANNING PHASE  
**Deliverables**: Frontend structure, pages, routing, UI system, SEO strategy, state management

---

## 1. NEXT.JS PROJECT SETUP OVERVIEW

### 1.1 Technology Stack (Confirmed)

```
Framework:     Next.js 15 (App Router)
Language:      TypeScript
Styling:       Tailwind CSS
UI Components: Shadcn UI
State Mgmt:    TanStack Query (React Query)
HTTP Client:   Axios with interceptors
Authentication: Token-based (stored in localStorage)
Hosting:       Same VPS as backend (or separate subdomain)
```

### 1.2 Project Directory Structure

```
maadin-frontend/
├── app/
│   ├── layout.tsx (root layout)
│   ├── page.tsx (homepage)
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── register/page.tsx
│   │   ├── login/page.tsx
│   │   ├── verify-email/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (shop)/
│   │   ├── layout.tsx (shop layout with navbar)
│   │   ├── page.tsx (products listing/homepage)
│   │   ├── products/
│   │   │   ├── page.tsx (product listing with filters)
│   │   │   ├── [slug]/page.tsx (product detail)
│   │   │   └── search/page.tsx (search results)
│   │   ├── stores/
│   │   │   ├── page.tsx (all stores)
│   │   │   └── [store_slug]/page.tsx (store detail)
│   │   ├── cart/page.tsx
│   │   ├── wishlist/page.tsx
│   │   └── checkout/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx (dashboard layout with sidebar)
│   │   ├── customer/
│   │   │   ├── page.tsx (customer dashboard)
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   ├── reviews/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   ├── messages/[conversationId]/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── seller/
│   │   │   ├── page.tsx (seller dashboard)
│   │   │   ├── store/page.tsx (store settings)
│   │   │   ├── products/page.tsx
│   │   │   ├── products/new/page.tsx
│   │   │   ├── products/[id]/edit/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── messages/page.tsx
│   │   └── admin/
│   │       ├── page.tsx (admin dashboard)
│   │       ├── users/page.tsx
│   │       ├── users/[id]/page.tsx
│   │       ├── sellers/page.tsx
│   │       ├── sellers/[id]/page.tsx
│   │       ├── products/page.tsx
│   │       ├── orders/page.tsx
│   │       ├── conversations/page.tsx
│   │       ├── conversations/[id]/page.tsx
│   │       ├── penalties/page.tsx
│   │       ├── analytics/page.tsx
│   │       └── settings/page.tsx
│   ├── api/
│   │   └── revalidate/route.ts (ISR revalidation endpoint)
│   └── globals.css (global styles + Tailwind)
├── components/
│   ├── ui/ (Shadcn UI components)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── form.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── tooltip.tsx
│   │   ├── pagination.tsx
│   │   └── loading-spinner.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilter.tsx
│   │   ├── ProductDetail.tsx
│   │   └── ImageGallery.tsx
│   ├── shop/
│   │   ├── StoreCard.tsx
│   │   ├── CartSummary.tsx
│   │   ├── CartItem.tsx
│   │   ├── CheckoutForm.tsx
│   │   └── RatingStars.tsx
│   ├── messages/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ConversationList.tsx
│   │   └── MessageBubble.tsx
│   ├── admin/
│   │   ├── UserTable.tsx
│   │   ├── SellerVerificationForm.tsx
│   │   ├── PenaltyForm.tsx
│   │   └── ConversationViewer.tsx
│   └── common/
│       ├── ErrorBoundary.tsx
│       ├── LoadingSkeletons.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── api.ts (Axios instance + interceptors)
│   ├── auth.ts (auth utilities)
│   ├── storage.ts (localStorage helpers)
│   ├── types.ts (TypeScript types)
│   ├── constants.ts (app constants)
│   ├── utils.ts (utility functions)
│   ├── validators.ts (form validation)
│   ├── hooks/
│   │   ├── useAuth.ts (auth context)
│   │   ├── useCart.ts (cart state)
│   │   ├── useProducts.ts (products query)
│   │   ├── useOrders.ts (orders query)
│   │   └── useMessages.ts (messages query)
│   └── query/
│       ├── keys.ts (React Query key factory)
│       └── queryClient.ts (TanStack Query setup)
├── store/
│   ├── authStore.ts (Zustand - auth state)
│   └── cartStore.ts (Zustand - cart state)
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero.jpg
│   │   └── placeholders/
│   ├── icons/
│   └── fonts/
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── animations.css
├── .env.local (development)
├── .env.production (production)
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

---

## 2. PAGE ROUTING STRUCTURE

### 2.1 App Router Organization (Next.js 15)

#### Public Pages (No Auth Required)

```
/                          → Homepage (product listing + featured stores)
/products                  → Product listing with filters
/products/[slug]           → Product detail page
/products/search           → Search results
/stores                    → All stores directory
/stores/[store_slug]       → Store detail page (products + reviews)
/register                  → Customer registration
/login                     → User login
/verify-email              → Email verification flow
/forgot-password           → Password reset request
```

#### Protected Pages (Auth Required)

```
/customer/                 → Customer dashboard (redirect if not customer)
/customer/orders           → Order history
/customer/orders/[id]      → Order details + tracking
/customer/reviews          → My reviews
/customer/wishlist         → Saved items
/customer/messages         → Chat conversations
/customer/messages/[id]    → Chat with seller
/customer/profile          → Account settings

/seller/                   → Seller dashboard
/seller/store              → Store settings (name, logo, banner)
/seller/products           → My products
/seller/products/new       → Add product
/seller/products/[id]/edit → Edit product
/seller/orders             → Incoming orders
/seller/orders/[id]        → Order details
/seller/analytics          → Sales analytics
/seller/messages           → Customer conversations

/admin/                    → Admin dashboard
/admin/users               → User management
/admin/users/[id]          → User details + actions
/admin/sellers             → Seller verification
/admin/sellers/[id]        → Seller details + verify/suspend
/admin/products            → Product moderation
/admin/orders              → All orders
/admin/conversations       → Moderation queue
/admin/conversations/[id]  → Conversation + moderation tools
/admin/penalties           → Apply penalties
/admin/analytics           → Platform analytics
/admin/settings            → Platform settings
```

### 2.2 Route Groups (Organization)

```
(auth)       → Login, register, verification pages
             → Layout: Centered form, no navbar
             
(shop)       → Product browsing, stores, cart, checkout
             → Layout: Full navbar + footer
             
(dashboard)  → Customer, seller, admin dashboards
             → Layout: Sidebar navigation + content area
             → Middleware: Protect by role
```

### 2.3 Dynamic Routes

```
[slug]       → Product slug (auto-generated from name)
[store_slug] → Store slug (auto-generated from store_name)
[id]         → Numeric IDs for orders, users, etc.
[conversationId] → Message conversations
```

---

## 3. LAYOUT SYSTEM

### 3.1 Root Layout (app/layout.tsx)

```typescript
import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'MAADIN - Moroccan Artisan Marketplace',
  description: 'Discover authentic Moroccan artisan products directly from creators',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://maadin.ma',
    title: 'MAADIN Marketplace',
    description: 'Authentic Moroccan artisan products',
    images: [{
      url: 'https://maadin.ma/og-image.jpg',
      width: 1200,
      height: 630,
    }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 3.2 Shop Layout (app/(shop)/layout.tsx)

```typescript
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
```

### 3.3 Dashboard Layout (app/(dashboard)/layout.tsx)

```typescript
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

## 4. COMPONENT ORGANIZATION

### 4.1 Component Hierarchy

```
RootLayout
├── Providers (Query, Auth, Theme)
└── Route-specific Layout
    ├── Navbar
    ├── MainContent
    │   ├── Page Component (pages/)
    │   └── Sub-components (components/)
    └── Footer/Sidebar
```

### 4.2 Shadcn UI Integration

```bash
# Install Shadcn components used:
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add pagination
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add textarea
```

### 4.3 Custom Components Example

#### ProductCard Component
```typescript
// components/product/ProductCard.tsx

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RatingStars from './RatingStars';

interface ProductCardProps {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    rating: number;
    total_reviews: number;
    primary_image: { image_path: string };
    seller: { store_name: string; level: string };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative h-48 w-full bg-gray-200">
          {product.primary_image ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${product.primary_image.image_path}`}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">No image</div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Seller badge */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {product.seller.level}
            </Badge>
          </div>

          {/* Product name */}
          <h3 className="font-semibold text-sm line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <RatingStars rating={product.rating} />
            <span className="text-xs text-gray-500">
              ({product.total_reviews})
            </span>
          </div>

          {/* Price */}
          <div className="text-lg font-bold text-primary">
            {product.price.toFixed(2)} MAD
          </div>
        </div>
      </Card>
    </Link>
  );
}
```

---

## 5. STATE MANAGEMENT

### 5.1 Auth State (Context + Zustand)

```typescript
// lib/hooks/useAuth.ts

import { useContext, createContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  email_verified_at: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// In components:
// const { user, isAuthenticated, login, logout } = useAuth();
```

### 5.2 Cart State (Zustand)

```typescript
// store/cartStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  seller_id: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (product_id: number) => void;
  updateQuantity: (product_id: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (item) => set((state) => ({
        items: [...state.items, item],
      })),

      removeItem: (product_id) => set((state) => ({
        items: state.items.filter((i) => i.product_id !== product_id),
      })),

      updateQuantity: (product_id, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.product_id === product_id ? { ...i, quantity } : i
        ),
      })),

      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'maadin-cart',
      storage: localStorage,
    }
  )
);
```

### 5.3 Queries (TanStack Query)

```typescript
// lib/query/keys.ts

export const queryKeys = {
  all: ['products'],
  lists: () => [...queryKeys.all, 'list'],
  list: (filters: unknown) => [...queryKeys.lists(), filters],
  details: () => [...queryKeys.all, 'detail'],
  detail: (id: number) => [...queryKeys.details(), id],
  
  orders: () => ['orders'],
  orderList: (filters: unknown) => [...queryKeys.orders(), 'list', filters],
  orderDetail: (id: number) => [...queryKeys.orders(), 'detail', id],

  messages: () => ['messages'],
  conversations: () => [...queryKeys.messages(), 'conversations'],
  conversation: (id: number) => [...queryKeys.messages(), 'conversation', id],
};
```

```typescript
// lib/hooks/useProducts.ts

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { apiClient } from '@/lib/api';

interface ProductFilters {
  category_id?: number;
  search?: string;
  page?: number;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: queryKeys.list(filters),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/products', {
        params: filters,
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.detail(slug),
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/products/${slug}`);
      return data.data;
    },
  });
}
```

---

## 6. API CLIENT SETUP

### 6.1 Axios Instance with Interceptors

```typescript
// lib/api.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { storage } from './storage';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 (expired token)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, clear and redirect to login
      storage.clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 6.2 Local Storage Helpers

```typescript
// lib/storage.ts

export const storage = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('auth_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  },
};
```

---

## 7. TYPESCRIPT TYPES

### 7.1 Core Types

```typescript
// lib/types.ts

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'customer' | 'seller' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  avatar_path: string | null;
  email_verified_at: string | null;
  created_at: string;
}

export interface Seller {
  id: number;
  user_id: number;
  store_name: string;
  store_slug: string;
  store_description: string | null;
  logo_path: string | null;
  banner_path: string | null;
  rating: number;
  total_reviews: number;
  status: 'pending' | 'verified' | 'suspended';
  level: 'bronze' | 'silver' | 'gold' | 'verified_artisan';
  total_orders: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon_path: string | null;
  parent_id: number | null;
}

export interface Product {
  id: number;
  seller_id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  price: number;
  stock_quantity: number;
  rating: number;
  total_reviews: number;
  total_sales: number;
  is_active: boolean;
  created_at: string;
  seller?: Seller;
  category?: Category;
  images: ProductImage[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_path: string;
  alt_text: string | null;
  is_primary: boolean;
}

export interface Order {
  id: number;
  customer_id: number;
  seller_id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_price: number;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  payment_method: 'cash';
  notes: string | null;
  tracking_number: string | null;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface Review {
  id: number;
  product_id: number;
  customer_id: number;
  seller_id: number;
  rating: number;
  title: string | null;
  content: string;
  is_verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  has_blocked_content: boolean;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  buyer_id: number;
  seller_id: number;
  product_id: number | null;
  order_id: number | null;
  last_message_at: string;
  status: 'active' | 'archived';
  messages: Message[];
}
```

---

## 8. SEO STRATEGY

### 8.1 Metadata & Open Graph

```typescript
// app/(shop)/products/[slug]/page.tsx

import type { Metadata } from 'next';
import { apiClient } from '@/lib/api';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch product from API
  const { data } = await apiClient.get(`/api/v1/products/${params.slug}`);
  const product = data.data;

  return {
    title: `${product.name} | MAADIN Marketplace`,
    description: product.short_description || product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.short_description,
      type: 'product',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.primary_image.image_path}`,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    keywords: [product.name, product.category.name, 'Moroccan artisan'],
  };
}

export default function ProductPage({ params }: Props) {
  // Page component
}
```

### 8.2 XML Sitemap

```typescript
// app/sitemap.ts

import { MetadataRoute } from 'next';
import { apiClient } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all products
  const { data: products } = await apiClient.get('/api/v1/products?per_page=10000');

  const productEntries = products.data.map((product: any) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
    lastModified: product.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products`,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/stores`,
      lastModified: new Date(),
      priority: 0.8,
    },
    ...productEntries,
  ];
}
```

### 8.3 Robots.txt

```typescript
// app/robots.ts

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/customer', '/seller', '/api'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
```

### 8.4 Schema.org Markup

```typescript
// lib/schema.ts

export function generateProductSchema(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: `${process.env.NEXT_PUBLIC_API_URL}/storage/${product.primary_image.image_path}`,
    brand: {
      '@type': 'Brand',
      name: product.seller.store_name,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'MAD',
      availability: product.stock_quantity > 0 ? 'InStock' : 'OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.total_reviews,
    },
  };
}

// In page:
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{
//     __html: JSON.stringify(generateProductSchema(product)),
//   }}
// />
```

---

## 9. FORM HANDLING WITH VALIDATION

### 9.1 Form Validators

```typescript
// lib/validators.ts

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password at least 8 characters'),
  phone: z.string().regex(/^(\+212|0)[67]\d{8}$/, 'Invalid Moroccan phone'),
});

export const productSchema = z.object({
  name: z.string().min(3, 'Product name at least 3 characters'),
  category_id: z.number().positive(),
  price: z.number().positive('Price must be positive'),
  stock_quantity: z.number().nonnegative(),
  description: z.string().min(50, 'Description at least 50 characters'),
  short_description: z.string().max(500).optional(),
});

export const checkoutSchema = z.object({
  shipping_address: z.string().min(5),
  shipping_city: z.string().min(2),
  shipping_phone: z.string().regex(/^(\+212|0)[67]\d{8}$/),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
```

### 9.2 React Hook Form Integration

```typescript
// components/auth/LoginForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // API call
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('email')}
          type="email"
          placeholder="Email"
        />
        {errors.email && (
          <span className="text-sm text-red-500">{errors.email.message}</span>
        )}
      </div>

      <div>
        <Input
          {...register('password')}
          type="password"
          placeholder="Password"
        />
        {errors.password && (
          <span className="text-sm text-red-500">{errors.password.message}</span>
        )}
      </div>

      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
}
```

---

## 10. IMAGE OPTIMIZATION

### 10.1 Next.js Image Component

```typescript
// components/product/ImageGallery.tsx

import Image from 'next/image';
import { useState } from 'react';

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ImageGallery({
  images,
  productName,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${selectedImage.image_path}`}
          alt={selectedImage.alt_text || productName}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className={`relative aspect-square rounded border-2 overflow-hidden ${
              selectedImage.id === image.id
                ? 'border-primary'
                : 'border-transparent'
            }`}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${image.image_path}`}
              alt={image.alt_text || productName}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 11. PROTECTED ROUTES & MIDDLEWARE

### 11.1 Protected Route Component

```typescript
// components/auth/ProtectedRoute.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'customer' | 'seller' | 'admin';
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    router.push('/');
    return null;
  }

  return <>{children}</>;
}
```

### 11.2 Middleware (Edge-level)

```typescript
// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/customer') ||
      request.nextUrl.pathname.startsWith('/seller') ||
      request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/customer/:path*', '/seller/:path*', '/admin/:path*'],
};
```

---

## 12. NEXT.JS CONFIGURATION

### 12.1 next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'https',
        hostname: 'api.maadin.ma',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Rewrites for API calls (optional proxy)
  rewrites: async () => ({
    afterFiles: [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ],
  }),

  // Compression
  compress: true,

  // Generate static pages on demand
  experimental: {
    isrMemoryCacheSize: 52 * 1024 * 1024, // 52MB
  },
};

module.exports = nextConfig;
```

### 12.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleResolution": "node",
    "allowImportingTsExtensions": true,
    "paths": {
      "@/*": ["./*"]
    },
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 12.3 tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37', // Gold (Moroccan)
        secondary: '#1a1a1a', // Dark
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

---

## 13. ENVIRONMENT VARIABLES (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true

# Third-party (Future)
# NEXT_PUBLIC_STRIPE_KEY=
# NEXT_PUBLIC_GOOGLE_OAUTH_ID=
```

---

## 14. DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All types correct (no TypeScript errors)
- [ ] All pages tested locally
- [ ] Environment variables configured
- [ ] Image optimization verified
- [ ] SEO tags all present
- [ ] Mobile responsiveness tested
- [ ] Performance optimized (Lighthouse > 90)
- [ ] Build succeeds: `npm run build`

### Deployment Commands
```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to VPS
git push production main
# (CI/CD pipeline handles deployment)
```

---

## 15. NEXT STEPS (Phase 4 COMPLETE)

✅ **Phase 4 Deliverables**:
1. ✓ Complete page structure (20+ pages)
2. ✓ Route organization (public, auth, shop, dashboard)
3. ✓ Layout system (root, shop, dashboard)
4. ✓ Component hierarchy (Shadcn UI integration)
5. ✓ State management (Auth context + Zustand + TanStack Query)
6. ✓ API client with interceptors
7. ✓ TypeScript types (15+ interfaces)
8. ✓ SEO strategy (metadata, sitemap, robots, schema)
9. ✓ Form validation (Zod + React Hook Form)
10. ✓ Image optimization
11. ✓ Protected routes & middleware
12. ✓ Next.js configuration
13. ✓ Deployment strategy

### 🔄 Upon Approval, Phase 5 Begins:
- Backend API Implementation
- Frontend Pages & Components
- Integration Testing
- Performance Optimization
- Deployment Preparation

---

**Document Version**: 4.0  
**Status**: 🟡 AWAITING APPROVAL FOR PHASE 5
