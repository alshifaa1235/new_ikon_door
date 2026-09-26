# New Ikon Doors

A modern, high-performance web platform and catalog management system for **New Ikon Doors** — showcasing premium doors, laminates, veneer finishes, digital catalogs, branch locations, and customer inquiries with an integrated administration portal.

---

## 🚀 Features

- **Dynamic Product Showcase**: Explore door collections with multi-angle views, dimension specifications, material finishes, and zoom capabilities.
- **Interactive Catalogue**: Interactive digital catalogue viewer for browsing print-ready and digital door collections.
- **Branch Locator**: Discover branch locations across South India with contact details, maps, and manager contacts.
- **Instant Quote & Enquiries**: Interactive request-a-quote workflow with dynamic inquiry submissions.
- **Admin Management Portal**: Built-in administration dashboard for managing collections, doors, inquiries, testimonials, and SEO settings.
- **High-Performance Architecture**: Built with React 18, Vite, custom CSS design tokens, and lightweight zero-dependency SQLite backend (`node:sqlite`).
- **Production Ready**: Optimized asset delivery, comprehensive SEO meta tags, OpenGraph data, and Vercel edge rewrite configurations.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Lucide Icons, Modern Vanilla CSS Design System
- **Backend & Data**: Node.js, Embedded SQLite (`node:sqlite`), RESTful Vite Dev Handler (`server/api.js`)
- **Automation & Tools**: Python scripts for OpenCV/OCR door extraction and asset optimization
- **Hosting / Deploy**: Vercel configuration (`vercel.json`)

---

## 📦 Getting Started

### Prerequisites

- Node.js (v20+ recommended for `node:sqlite`)
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
├── data/                  # SQLite database (new_ikon_doors.db)
├── extracted_catalogue/   # Catalog source images and extraction data
├── public/                # Static assets, door images, videos, logos
├── server/                # SQLite initialization and API handlers
│   ├── api.js             # REST API routes and request handling
│   └── db.js              # Database connection and queries
├── src/                   # React frontend application
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route pages (Home, Catalogue, Admin, etc.)
│   └── services/          # Client API calls and helpers
├── start_project.py       # Automated port-checking startup script
├── vercel.json            # Vercel deployment configuration
└── vite.config.js         # Vite build and server configuration
```

---

## 📄 License

All rights reserved © New Ikon Doors.
