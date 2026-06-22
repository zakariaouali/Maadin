# MAADIN Marketplace - Phase 1: Architecture & Planning

**Project**: Moroccan Artisans Marketplace (SaaS)  
**Approach**: MVP-First, Production-Ready  
**Status**: Planning Phase (Awaiting Approval)

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Core Features

#### Product Management
- [ ] Product catalog with images, descriptions, pricing
- [ ] Stock management with inventory tracking
- [ ] Product filtering by category, price, rating, seller
- [ ] Product search with relevance ranking
- [ ] Product variants (size, color, etc.) support
- [ ] Wishlist functionality

#### Store Management
- [ ] Seller can create and customize store profile
- [ ] Store branding (logo, banner, description)
- [ ] Store ratings and reviews aggregation
- [ ] Store analytics dashboard (basic)

#### Order Management
- [ ] Shopping cart functionality
- [ ] Order placement and confirmation
- [ ] Order status tracking (pending, confirmed, shipped, delivered)
- [ ] Cash on Delivery (Phase 1) payment method
- [ ] Order history for customers

#### Review & Rating System
- [ ] Customers can leave reviews and ratings on products
- [ ] Customers can rate sellers
- [ ] Review moderation (admin)
- [ ] Rating calculation (product, seller, store)

#### Messaging System
- [ ] Real-time chat between customers and sellers
- [ ] Message history
- [ ] Conversation management
- [ ] Message notifications
- [ ] Content filtering (blocks: phone numbers, WhatsApp, emails, links, social media)
- [ ] Admin conversation viewing for disputes

#### Authentication & Authorization
- [ ] Email/password registration and login
- [ ] Email verification
- [ ] Google OAuth (optional Phase 1)
- [ ] Role-based access control (customer, seller, admin)
- [ ] Password reset functionality

#### Admin Dashboard
- [ ] User management (suspend, verify, ban)
- [ ] Seller management (approve applications, apply penalties)
- [ ] Product moderation
- [ ] Order monitoring
- [ ] Revenue analytics
- [ ] Conversation monitoring
- [ ] Platform health dashboard

#### Seller Dashboard
- [ ] Product management (CRUD)
- [ ] Order management and fulfillment
- [ ] Analytics (sales, views, revenue)
- [ ] Customer chat interface
- [ ] Store settings
- [ ] Seller rating visibility

#### Customer Dashboard
- [ ] Order history and tracking
- [ ] Wishlist management
- [ ] Chat with sellers
- [ ] Review management
- [ ] Account settings
- [ ] Invoice generation

---

## 2. USER STORIES

### 2.1 CUSTOMER User Stories

**Authentication & Onboarding**
- As a customer, I can register with email and password so that I can access the platform
- As a customer, I can verify my email so that my account is secure
- As a customer, I can login with email/password so that I can access my account
- As a customer, I can reset my password so that I can regain access if forgotten
- As a customer, I can login with Google (optional) so that registration is faster

**Browsing & Discovery**
- As a customer, I can browse products without logging in so that I can explore the marketplace
- As a customer, I can view store profiles without logging in so that I understand seller credibility
- As a customer, I can search products by keyword so that I find what I'm looking for
- As a customer, I can filter products by category so that I find relevant items
- As a customer, I can filter products by price range so that I stay within budget
- As a customer, I can filter products by rating so that I see quality items
- As a customer, I can sort results by popularity, newest, or lowest price so that I find products efficiently
- As a customer, I can view detailed product information and images so that I make informed decisions

**Wishlist**
- As a customer, I can add products to wishlist so that I remember items for later
- As a customer, I can view my wishlist so that I can purchase saved items
- As a customer, I can remove items from wishlist so that I keep it organized

**Shopping & Checkout**
- As a customer, I can add products to cart so that I can purchase multiple items
- As a customer, I can view my cart so that I review my selections
- As a customer, I can modify cart quantities so that I adjust my order
- As a customer, I can remove items from cart so that I change my mind
- As a customer, I can checkout with Cash on Delivery so that I can pay at delivery
- As a customer, I can see order total including shipping so that I understand final cost
- As a customer, I can place an order so that I purchase products

**Order Management**
- As a customer, I can view my order history so that I track past purchases
- As a customer, I can track order status in real-time so that I know when to expect delivery
- As a customer, I can receive order confirmation emails so that I have proof of purchase
- As a customer, I can download invoice from my order so that I have tax documentation

**Reviews & Ratings**
- As a customer, I can rate and review products after purchase so that I help others decide
- As a customer, I can rate sellers so that I provide feedback on service quality
- As a customer, I can view other customers' reviews so that I make informed purchases
- As a customer, I can edit my reviews so that I can correct or update my feedback
- As a customer, I can delete my reviews so that I can retract if necessary

**Messaging**
- As a customer, I can message sellers to ask product questions so that I get information before buying
- As a customer, I can view chat history with sellers so that I track conversations
- As a customer, I can receive notifications on new messages so that I don't miss seller responses

**Account Management**
- As a customer, I can view my profile so that I see my account details
- As a customer, I can update my address so that orders ship to the correct location
- As a customer, I can update my profile information so that my data is current
- As a customer, I can logout so that my account is secure

---

### 2.2 SELLER User Stories

**Authentication & Onboarding**
- As a seller, I can register for a seller account so that I can start selling
- As a seller, I can complete seller verification so that customers trust my store
- As a seller, I can create a store profile so that customers see my brand
- As a seller, I can customize my store banner and logo so that I establish brand identity
- As a seller, I can write store description so that customers understand what I sell

**Product Management**
- As a seller, I can add products with images, descriptions, and pricing so that customers see my items
- As a seller, I can upload multiple product images so that customers see products clearly
- As a seller, I can set product categories so that customers can find my items
- As a seller, I can set product stock so that overselling is prevented
- As a seller, I can edit product details so that I keep information current
- As a seller, I can delete products so that I remove outdated items
- As a seller, I can view product performance analytics so that I understand what sells

**Store Management**
- As a seller, I can view my store rating so that I understand customer satisfaction
- As a seller, I can view customer reviews about my store so that I see feedback

**Order Management**
- As a seller, I can view incoming orders so that I fulfill them
- As a seller, I can see order details including customer address so that I ship correctly
- As a seller, I can update order status (confirmed, shipped) so that customers track delivery
- As a seller, I can mark order as delivered so that fulfillment is complete
- As a seller, I can view my sales analytics so that I understand business performance

**Messaging**
- As a seller, I can receive messages from customers so that I answer product questions
- As a seller, I can respond to customer messages so that I provide support
- As a seller, I can view all conversations so that I manage customer relationships
- As a seller, I can receive notifications on new messages so that I respond quickly

**Account Management**
- As a seller, I can update bank account details so that payments are transferred
- As a seller, I can update my contact information so that platform can reach me
- As a seller, I can view my seller rating/level so that I understand my standing

---

### 2.3 ADMIN User Stories

**User Management**
- As an admin, I can view all users so that I monitor platform activity
- As an admin, I can view user details so that I understand account information
- As an admin, I can suspend users so that I can prevent misuse
- As an admin, I can ban users so that I remove bad actors
- As an admin, I can reset user verification so that I can fix account issues
- As an admin, I can view user purchase and selling history so that I make informed decisions

**Seller Management**
- As an admin, I can approve seller applications so that only verified sellers operate
- As an admin, I can view seller details including verification docs so that I verify legitimacy
- As an admin, I can apply penalties to sellers so that I enforce marketplace rules
- As an admin, I can suspend seller stores so that I stop problematic sales
- As an admin, I can view seller metrics so that I monitor platform quality

**Product Moderation**
- As an admin, I can view all products so that I monitor quality
- As an admin, I can remove inappropriate products so that marketplace stays safe
- As an admin, I can check for duplicate/fake products so that I prevent fraud
- As an admin, I can flag products for review so that I mark suspicious items

**Order Monitoring**
- As an admin, I can view all orders so that I monitor sales
- As an admin, I can view order details so that I understand transactions
- As an admin, I can resolve order disputes so that I handle issues fairly
- As an admin, I can see refund requests so that I manage returns

**Messaging Moderation**
- As an admin, I can view conversations between buyers and sellers so that I ensure compliance
- As an admin, I can see blocked message content so that I verify filtering works
- As an admin, I can remove conversations or messages so that I enforce rules
- As an admin, I can read full message history so that I investigate disputes

**Analytics & Insights**
- As an admin, I can view platform analytics so that I understand business health
- As an admin, I can see revenue metrics so that I track income
- As an admin, I can see user growth trends so that I monitor adoption
- As an admin, I can generate reports so that I make data-driven decisions

**Platform Settings**
- As an admin, I can manage platform-wide settings so that I control behavior
- As an admin, I can set commission rates so that I configure revenue model
- As an admin, I can manage content categories so that I organize products
- As an admin, I can configure email templates so that communications are consistent

---

## 3. SYSTEM ARCHITECTURE

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│  Next.js App (TypeScript, Tailwind, Shadcn UI, TanStack)   │
│  ├─ Customer Interface (Browse, Shop, Review)              │
│  ├─ Seller Dashboard (Product, Order, Analytics)           │
│  └─ Admin Dashboard (Moderation, Analytics, Users)         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API + WebSocket
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    API LAYER (Middleware)                   │
│  Laravel REST API (JSON)                                   │
│  ├─ Authentication Endpoints (Laravel Sanctum tokens)      │
│  ├─ Product Endpoints                                      │
│  ├─ Order Endpoints                                        │
│  ├─ User Endpoints                                         │
│  ├─ Chat Endpoints                                         │
│  └─ Admin Endpoints                                        │
│                                                             │
│  Real-time Messaging (Laravel Broadcasting + WebSocket)    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                       │
│  ├─ Authentication & Authorization Service                 │
│  ├─ Product Service                                        │
│  ├─ Order Service                                          │
│  ├─ User Service                                           │
│  ├─ Messaging Service (with content filtering)             │
│  ├─ Review & Rating Service                                │
│  ├─ Analytics Service                                      │
│  └─ Seller Management Service                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    DATA LAYER                               │
│  ├─ MySQL Database                                         │
│  ├─ File Storage (Laravel public disk)                     │
│  │  └─ /storage/app/public/                                │
│  │     ├─ products/                                        │
│  │     ├─ stores/                                          │
│  │     ├─ users/                                           │
│  │     └─ temp/                                            │
│  └─ Cache Layer (optional for Phase 2)                     │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack Justification

**Frontend: Next.js**
- Static generation + SSR for SEO optimization
- Built-in API routes (future serverless potential)
- Image optimization
- Fast development experience
- Great for marketplace UI complexity

**Backend: Laravel**
- Mature, battle-tested ecosystem
- Excellent ORM (Eloquent) for complex relationships
- Strong security features (CSRF, XSS protection)
- Rich package ecosystem (Nova, Telescope)
- Easy to maintain and scale
- Great for beginners learning architecture

**Database: MySQL**
- ACID compliance for transactions
- Perfect for relational marketplace data
- Affordable hosting support
- Sufficient for MVP + scaling

**Authentication: Laravel Sanctum**
- Token-based authentication
- SPA support built-in
- No external service dependency
- Simple to implement

**Storage: Local Filesystem**
- MVP requirement (no S3)
- Stored in `/storage/app/public`
- Easy backup on VPS
- Image serving through Laravel

---

## 4. DATABASE DESIGN (MVP)

### 4.1 Core Tables & Relationships

#### Users Table
```
users
├─ id (PK)
├─ name
├─ email (UNIQUE)
├─ email_verified_at
├─ password
├─ phone
├─ role (enum: customer, seller, admin)
├─ status (enum: active, suspended, banned)
├─ avatar_path
├─ created_at
├─ updated_at
└─ deleted_at (soft delete)
```

#### Sellers Table
```
sellers
├─ id (PK)
├─ user_id (FK → users)
├─ store_name
├─ store_slug (UNIQUE)
├─ store_description
├─ logo_path
├─ banner_path
├─ rating (decimal: 0-5)
├─ total_reviews
├─ status (enum: pending, verified, suspended)
├─ level (enum: bronze, silver, gold, verified_artisan)
├─ total_orders
├─ response_time_hours
├─ created_at
├─ updated_at
└─ deleted_at
```

#### Categories Table
```
categories
├─ id (PK)
├─ name
├─ slug (UNIQUE)
├─ description
├─ icon_path
├─ parent_id (FK → categories, for subcategories)
├─ display_order
├─ created_at
└─ updated_at
```

#### Products Table
```
products
├─ id (PK)
├─ seller_id (FK → sellers)
├─ category_id (FK → categories)
├─ name
├─ slug (UNIQUE)
├─ description
├─ short_description
├─ price (decimal)
├─ cost (decimal, hidden from customers)
├─ stock_quantity
├─ sku (optional)
├─ rating (decimal: 0-5)
├─ total_reviews
├─ total_sales
├─ is_active
├─ created_at
├─ updated_at
└─ deleted_at
```

#### Product Images Table
```
product_images
├─ id (PK)
├─ product_id (FK → products)
├─ image_path
├─ alt_text
├─ display_order
├─ is_primary
├─ created_at
└─ updated_at
```

#### Orders Table
```
orders
├─ id (PK)
├─ customer_id (FK → users)
├─ seller_id (FK → sellers)
├─ order_number (UNIQUE)
├─ status (enum: pending, confirmed, shipped, delivered, cancelled)
├─ total_price (decimal)
├─ shipping_address (json or separate table)
├─ shipping_city
├─ shipping_phone
├─ payment_method (enum: cash)
├─ notes
├─ tracking_number
├─ shipped_at
├─ delivered_at
├─ created_at
├─ updated_at
└─ deleted_at
```

#### Order Items Table
```
order_items
├─ id (PK)
├─ order_id (FK → orders)
├─ product_id (FK → products)
├─ seller_id (FK → sellers, denormalized for quick access)
├─ quantity
├─ price_at_purchase (decimal)
├─ created_at
└─ updated_at
```

#### Reviews Table
```
reviews
├─ id (PK)
├─ product_id (FK → products)
├─ order_id (FK → orders)
├─ customer_id (FK → users)
├─ seller_id (FK → sellers)
├─ rating (int: 1-5)
├─ title
├─ content
├─ is_verified_purchase
├─ helpful_count
├─ status (enum: pending, approved, rejected)
├─ created_at
├─ updated_at
└─ deleted_at
```

#### Wishlists Table
```
wishlists
├─ id (PK)
├─ customer_id (FK → users)
├─ product_id (FK → products)
├─ created_at
└─ updated_at
```

#### Messages Table
```
messages
├─ id (PK)
├─ conversation_id (FK → conversations)
├─ sender_id (FK → users)
├─ receiver_id (FK → users)
├─ content (text)
├─ has_blocked_content (boolean)
├─ blocked_patterns (json array of detected patterns)
├─ is_read
├─ read_at
├─ created_at
└─ updated_at
```

#### Conversations Table
```
conversations
├─ id (PK)
├─ buyer_id (FK → users)
├─ seller_id (FK → users)
├─ product_id (FK → products, nullable)
├─ order_id (FK → orders, nullable)
├─ last_message_at
├─ status (enum: active, archived)
├─ created_at
├─ updated_at
└─ deleted_at
```

#### Penalties Table
```
penalties
├─ id (PK)
├─ seller_id (FK → sellers)
├─ admin_id (FK → users)
├─ reason (enum: fake_stock, delayed_order, bad_behavior, other)
├─ description
├─ penalty_type (enum: warning, suspension, ban)
├─ duration_days (nullable)
├─ expires_at
├─ created_at
└─ updated_at
```

#### Carts Table (Sessions)
```
carts
├─ id (PK)
├─ customer_id (FK → users, nullable for guests)
├─ session_id (for guest carts)
├─ data (json: [{product_id, quantity}, ...])
├─ created_at
├─ updated_at
└─ expires_at
```

---

### 4.2 Key Relationships

```
Users (1) ──→ (1) Sellers
       └──→ (Many) Orders (as customer)
       └──→ (Many) Reviews
       └──→ (Many) Messages
       └──→ (Many) Wishlists

Sellers (1) ──→ (Many) Products
         └──→ (Many) Orders (as seller)
         └──→ (Many) Penalties

Products (1) ──→ (Many) Product Images
         └──→ (Many) Order Items
         └──→ (Many) Reviews
         └──→ (Many) Wishlists

Orders (1) ──→ (Many) Order Items
       └──→ (Many) Reviews

Categories (1) ──→ (Many) Products
            └──→ (Many) Categories (self-referencing for subcategories)

Conversations (1) ──→ (Many) Messages
               └──→ (1) Buyer (User)
               └──→ (1) Seller (User)
```

---

### 4.3 Indexing Strategy

**High-Priority Indexes** (for MVP performance):
- `users`: email, role, status
- `sellers`: user_id, status, level
- `products`: seller_id, category_id, is_active, created_at
- `orders`: customer_id, seller_id, status, created_at
- `messages`: conversation_id, created_at, is_read
- `conversations`: buyer_id, seller_id, updated_at

**Search Optimization**:
- FULLTEXT index on `products(name, description)` for search
- Composite index: `products(category_id, is_active, created_at)`

---

## 5. MVP SCOPE DEFINITION

### 5.1 What's INCLUDED in MVP

✅ **Core Features**
- User registration, email verification, login
- Seller account creation and store profile
- Product listing with images
- Product search and category filtering
- Shopping cart and checkout
- Cash on Delivery orders
- Order tracking
- Product reviews and ratings
- Seller ratings/reviews
- Basic messaging between customers and sellers
- Admin dashboard (user, seller, product, order management)
- Basic analytics (sales, users, orders count)

✅ **Security**
- Email verification requirement
- Role-based access control (RBAC)
- CSRF protection
- XSS prevention
- Input validation and sanitization
- Password hashing (bcrypt)
- Message content filtering
- Rate limiting on API endpoints

✅ **SEO**
- Meta tags (title, description, og tags)
- XML sitemap
- Robots.txt
- Next.js static generation for product pages
- URL slug optimization
- Image alt text

---

### 5.2 What's EXCLUDED (Phase 2+)

❌ **Not in MVP**
- Google OAuth login
- Stripe/payment integration
- Seller penalties UI (admin can apply, but no automatic system)
- Email notifications (manual for now)
- SMS notifications
- Advanced analytics (charts, trends)
- Seller rating level automation
- Seller verification documents upload
- Product variants (size, color)
- Bulk operations
- Seller API
- Mobile app
- Multi-language support
- Multi-currency
- Shipping calculation
- Coupon system
- Affiliate system
- Real-time notifications (WebSocket for MVP)

---

### 5.3 MVP Success Metrics

**Functional Requirements Met**
- [ ] Users can register and verify email
- [ ] Sellers can create stores and add products
- [ ] Customers can search, filter, and buy products
- [ ] Orders can be placed and tracked
- [ ] Reviews can be left and viewed
- [ ] Messaging system works with content filtering
- [ ] Admin can moderate users, sellers, products, orders
- [ ] No code errors in production

**Performance Targets**
- Page load time: < 2 seconds
- API response time: < 500ms (p95)
- Search results: < 1 second
- No database N+1 queries

**Security Requirements**
- All passwords hashed
- Email verified before order
- Sellers verified before selling
- Admin can view/moderate all conversations
- No sensitive data leaked in URLs
- HTTPS enforced
- API rate limiting active

---

## 6. SECURITY CONSIDERATIONS

### 6.1 Authentication & Authorization

**Strategy**: Token-based with Laravel Sanctum

- Email verification required for customers before ordering
- Seller accounts require admin verification
- Admin has full access with audit trail
- Tokens expire after 30 days (refreshable)
- Password reset via email with time-limited token

**Session Management**:
- Secure HTTP-only cookies for auth tokens
- CSRF tokens on all state-changing requests
- Session timeout after 1 hour of inactivity

---

### 6.2 Data Protection

**User Data**:
- Hashed passwords (bcrypt, cost 12)
- Address data encrypted at rest (Phase 2: full encryption)
- Phone numbers visible only after order confirmed
- Email visible only to sellers after order

**Conversation Security**:
- Messages stored in database with timestamps
- No message encryption in MVP (in-transit HTTPS only)
- Admin can view all conversations
- Sensitive content detection and blocking
- Conversations immutable after creation

---

### 6.3 Fraud Prevention

**Product Listing**:
- Admin must approve new sellers
- Product images scanned for duplicates
- Seller penalties for fake stock
- Stock quantity validated on checkout

**Order Security**:
- Order total recalculated on backend
- Address validated
- Seller can't modify price after order placed
- Order history immutable

**Account Security**:
- IP-based suspicious activity detection (Phase 2)
- Account lockout after 5 failed login attempts
- Seller account requires identity verification (Phase 2)

---

### 6.4 Content Moderation

**Message Filtering** (server-side):
```
Blocked patterns:
- Phone numbers (Moroccan: +212, 06, 07)
- WhatsApp links
- Email addresses
- URLs (http, https, www)
- Social media handles (@, #)

Detection: Regex patterns + flagging in database
Response: Message marked as containing blocked content
Admin action: Can view/remove flagged messages
```

**Product Moderation**:
- Admin can remove products
- Users report abusive products
- Images checked for explicit content (Phase 2)

---

### 6.5 API Security

**Rate Limiting**:
- 100 requests/minute per IP (unauth)
- 500 requests/minute per user (auth)
- Stricter limits on login/register (5/minute)

**Input Validation**:
- All inputs validated server-side
- File uploads scanned for malware
- Image uploads limited to 5MB
- Maximum 10 images per product

**CORS Policy**:
- Frontend domain whitelisted
- Credentials required on requests
- No wildcard origins

---

## 7. MARKETPLACE BUSINESS RULES MAPPING

### 7.1 Seller Rules

| Rule | Enforcement | Consequence |
|------|-------------|-------------|
| No fake stock | System auto-reserves when order placed | Order cancelled if stock unavailable |
| No contact info visible | Contact hidden until order confirmed | Account penalty if shared externally |
| Must respond to messages | Track response time | Seller rating decreased, potential suspension |
| Must fulfill orders timely | Order status tracking | Penalty system applied |
| No duplicate products | Admin review + detection | Product removed, warning given |
| Profile must be verified | Manual admin approval | Can't list products until verified |

---

### 7.2 Customer Rules

| Rule | Enforcement | Consequence |
|------|-------------|-------------|
| Email must be verified | Verification before order | Can't checkout without verified email |
| One review per product per user | Unique constraint on DB | Can't submit duplicate review |
| Honest reviews only | Admin moderation | Fake reviews can be removed |
| Can't message before order | Conversation restricted | Only sellers can initiate with links |
| Must provide delivery address | Address validation | Can't proceed without valid address |

---

### 7.3 Platform Rules

| Rule | Enforcement | Consequence |
|------|-------------|-------------|
| Commission structure | Database enforced | Revenue tracking and reporting |
| Message content filtering | Server-side regex | Blocked content flagged and logged |
| Seller level system | Calculated from metrics | Automatic tier assignment (future) |
| Order confirmation required | Manual or auto accept | Order enters confirmed state |
| Dispute resolution | Admin-only | Admin mediates and resolves |
| Admin audit trail | Logged in admin_actions table | All changes tracked with admin ID |

---

### 7.4 Seller Ranking System

```
BRONZE (Default)
├─ Criteria: New seller, < 10 orders
├─ Visible: "New Seller" badge
└─ Restrictions: None

SILVER
├─ Criteria: 10-50 orders, 4.0+ rating
├─ Visible: "Silver Seller" badge
└─ Benefits: Featured in category filters

GOLD
├─ Criteria: 50+ orders, 4.5+ rating, <2% penalties
├─ Visible: "Gold Seller" badge
└─ Benefits: Featured listings, increased visibility

VERIFIED ARTISAN (Manual)
├─ Criteria: Manual admin approval + documents
├─ Visible: "Verified Artisan" badge with seal
└─ Benefits: Premium listing placement, trust boost
```

**Calculation** (Phase 2 automation):
- Based on: order count, rating, response time, penalty history
- Updated: Weekly or monthly
- Demotion: If metrics drop below tier threshold

---

### 7.5 Penalty System

**Levels**:
1. **Warning** - First offense, logged
2. **Suspension** - 7-30 days, can't list/sell
3. **Ban** - Permanent removal

**Offenses**:
- **Fake Stock**: Seller lists product without stock
- **Delayed Order**: Order not shipped within 7 days
- **Bad Behavior**: Abusive communication, fraud attempts
- **Quality Issues**: Multiple bad reviews in short time

---

## 8. DEVELOPMENT ROADMAP

### Phase 1: Planning & Architecture ✓ (THIS PHASE)
- Requirements definition
- Database schema design
- System architecture documentation
- Security strategy
- Business rules mapping

### Phase 2: Database Schema (NEXT - Awaiting Approval)
- SQL table creation scripts
- Relationships and constraints
- Migration strategy
- Seeding scripts
- ERD documentation

### Phase 3: Laravel Backend Architecture
- Project structure setup
- Authentication system (Laravel Sanctum)
- Core API endpoints
- Database models and migrations
- Authorization policies
- Error handling strategy

### Phase 4: Next.js Frontend Architecture
- Project structure setup
- Page layout and routing
- UI component library integration
- API client setup (TanStack Query)
- Authentication flow
- Responsive design strategy

### Phase 5-10: Incremental Implementation
- Backend API development (product, order, messaging, etc.)
- Frontend page development (matching backend progress)
- Integration testing
- Performance optimization
- Deployment preparation

### Phase 11+: Launch & Iteration
- Production deployment
- Monitoring setup
- Beta user testing
- Feedback incorporation
- Scaling preparations

---

## 9. NEXT STEPS

### ✅ Phase 1 Deliverables Complete:
1. ✓ Full functional requirements documented
2. ✓ User stories (customer, seller, admin) detailed
3. ✓ System architecture designed (simple, scalable)
4. ✓ Database schema with relationships defined
5. ✓ MVP scope clearly defined (in/out of scope)
6. ✓ Security considerations mapped
7. ✓ Marketplace business rules documented

### 🔄 Awaiting Your Approval:
- Review the architecture above
- Confirm MVP scope aligns with vision
- Approve database design
- Identify any missing requirements
- Ask questions about any section

### 📋 Phase 2 (Upon Approval):
- Generate full SQL schema
- Create migrations
- Define relationships in detail
- Provide ERD (Entity Relationship Diagram)
- Explain indexing strategy

---

## 10. ASSUMPTIONS & DECISIONS

**Assumptions Made**:
1. Single seller per user (1:1 relationship)
2. One order can have items from multiple sellers
3. Order is seller-scoped (separate order per seller if multi-seller cart)
4. Messages are peer-to-peer (not group chats)
5. Reviews are per product per user (one per product)
6. Cart stored server-side (not localStorage to prevent tampering)

**Simplified Decisions** (for MVP):
1. No shipping cost calculation (flat or free)
2. No tax calculation (can be added later)
3. No coupon system yet
4. Cash on Delivery only (Stripe Phase 2)
5. No real-time messaging (polling in MVP)
6. No notifications sent (can add email later)
7. No affiliate system (future feature)
8. Admin commission not collected (setup only)

---

## 📌 CRITICAL NOTES

- This is an MVP first, then scale approach
- All architecture decisions prioritize simplicity
- Database design supports future scaling (indexes, relationships ready)
- Security is foundational, not added later
- No over-engineering (monolith first, microservices never if not needed)
- Performance optimized from day 1 (proper indexing, caching strategy prepared)

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-19  
**Status**: 🔴 AWAITING APPROVAL
