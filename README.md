# New Ikon Doors

A modern, high-performance web platform and catalog management system for **New Ikon Doors** — showcasing premium doors, laminates, veneer finishes, digital catalogs, branch locations, and customer inquiries with an integrated administration portal.

---

## 🚀 Features

- **Dynamic Product Showcase**: Explore door collections with multi-angle views, dimension specifications, material finishes, and zoom capabilities.
- **Interactive Catalogue**: Digital catalogue viewer for browsing print-ready and digital door collections.
- **Branch Locator**: Discover branch locations across South India with contact details, maps, and manager contacts.
- **Instant Quote & Enquiries**: Interactive request-a-quote workflow with dynamic inquiry submissions.
- **Admin Management Portal**: Built-in administration dashboard for managing collections, doors, inquiries, testimonials, and SEO settings.
- **Dual-Mode Cloud Architecture**: Zero-config static & SQLite mode for local development, combined with Vercel Serverless Functions (`/api/*`) and Supabase PostgreSQL persistence for production.
- **Production Ready**: Optimized asset delivery, comprehensive SEO meta tags, OpenGraph data, and Vercel edge rewrite configurations.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Lucide Icons, Modern Vanilla CSS Design System
- **Serverless & API**: Vercel Serverless Functions (`api/index.js`), REST endpoints
- **Database**: Supabase (PostgreSQL in production) / Embedded SQLite (`data/new_ikon_doors.db` in local dev)
- **Automation & Tools**: Python scripts for OpenCV/OCR door extraction and asset optimization
- **Hosting / Deploy**: Vercel configuration (`vercel.json`)

---

## 📦 Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- Python 3.8+ (optional, for asset extraction utilities)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nav-in27/newikondoors.git
   cd newikondoors
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Or use the automated startup script:
   ```bash
   python start_project.py
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## ☁️ Deployment on Vercel & Supabase

### 1. Deploying to Vercel

The project is pre-configured with `vercel.json` and a serverless API handler in `api/index.js`.

#### Option A: One-Click via Vercel Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and import **`nav-in27/newikondoors`**.
3. Framework Preset will auto-detect as **Vite**.
4. Click **Deploy**.

#### Option B: Deploying via Vercel CLI
```bash
# Login to Vercel CLI
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

### 2. Setting Up Supabase (Optional for Cloud Persistence)

By default, the Vercel deployment operates with built-in embedded catalog data and accepts customer inquiries seamlessly. For full multi-device database persistence in the Admin Portal:

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase **SQL Editor**, paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. In your Vercel Project Settings (**Settings → Environment Variables**), add:
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY`: `your-anon-key`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your-service-role-key`
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `your-secure-password`
4. Seed your Supabase database with all 280+ doors and collections:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your-key node scripts/seed-supabase.js
   ```

---

## 🏗️ Building for Production

To create an optimized production build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## 📁 Project Structure

```
new-ikon-doors/
├── api/                   # Vercel Serverless Function entrypoint (api/index.js)
├── data/                  # SQLite database (new_ikon_doors.db)
├── extracted_catalogue/   # Catalog source images and extraction data
├── public/                # Static assets, door images, videos, logos
├── scripts/               # Migration and database seed scripts (seed-supabase.js)
├── server/                # SQLite & Supabase adapters and API handlers
│   ├── api.js             # REST API routes and request handling
│   ├── db.js              # SQLite database adapter
│   └── supabase.js        # Supabase PostgreSQL adapter
├── src/                   # React frontend application
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route pages (Home, Catalogue, Admin, etc.)
│   └── services/          # Client API calls and helpers
├── supabase/              # Supabase SQL migrations (schema.sql)
├── start_project.py       # Automated port-checking startup script
├── vercel.json            # Vercel deployment configuration
└── vite.config.js         # Vite build and server configuration
```

---

## 📄 License

All rights reserved © New Ikon Doors.
