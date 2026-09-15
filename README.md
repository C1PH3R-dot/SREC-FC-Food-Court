**Overview**

The SREC FC Food Court application is a high-performance, PWA-enabled digital ordering platform engineered to eliminate counter queues and streamline campus dining operations. Built specifically for high-volume food service, it offers an end-to-end digital solution for students, faculty, and food court staff.


**Key Features & Capabilities**

Progressive Web App (PWA) Integration: Operates directly from mobile and desktop browsers with "**Add to Home Screen**" support on iOS and Android. It delivers a native app experience without app store downloads.

**In-App SREC Wallet:** Features a dedicated digital wallet system—similar to popular quick-commerce platforms—allowing users to pre-load funds and execute instant, 1-click order checkouts to bypass payment gateway delays.
**Smart AI Food & Beverage Pairings:** An intelligent recommendation engine that dynamically suggests complementary snacks or beverages (e.g., suggesting hot chai with samosas or fresh juices with noodles) to enhance the dining experience.
**Real-Time Stock Synchronization:** Live inventory status badges ("IN STOCK" / "SOLD OUT") updated dynamically across the menu to prevent users from ordering unavailable items.
**Automated Digital Receipts:** Instant generation of timestamped digital receipts featuring unique transaction token IDs, customer metadata, and embedded barcodes/QR codes for rapid, paperless verification at the pickup counter.
**High-Quality Item Mapping:** Dynamic category filtering (Breakfast, Lunch, Bakery, Fresh Juices & Mojitos) paired with name-matched food photography instead of standard icons.
**Cache-Busting & Asset Control:** Optimized build hashing to ensure users always receive the latest live updates without stale browser caching issues.


**Technical Architecture & Design**

**Frontend: **Built with React and Vite for fast client-side rendering, styled using Tailwind CSS and custom glassmorphism UI components.
**Backend & Database:** Powered by a Node.js and Express API layer connected to a persistent PostgreSQL database for real-time order processing, wallet transaction logs, and inventory management.
**Security & Portability:** Features server-side authentication middleware for admin stock controls, with database portability configured for cloud PostgreSQL hosting (such as Neon or Supabase).
