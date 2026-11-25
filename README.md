# Docify — SmartDataAbstract AI

> **An all-in-one AI platform for document intelligence, tabular analytics, and comprehensive productivity utilities.**

---

## 🚀 Overview

Docify is a high-performance web platform designed to streamline knowledge extraction, document comprehension, automated tabular insights, and high-frequency document manipulations. Built with modern full-stack web technologies, Docify delivers an enterprise-grade experience across both light and pitch-black dark modes, with first-class multilingual support for **English**, **Gujarati**, and **Hindi**.

---

## 🧩 Core Modules

### 1. 📄 DocuMind (Document Intelligence & RAG)
- **Deep Extraction & OCR**: Process PDFs, DOCX, and TXT files, extracting high-fidelity text and tabular structures even from scanned pages.
- **3-Level Abstraction**:
  - *Level 1*: Executive 60-second summary.
  - *Level 2*: Key takeaways & structured action points.
  - *Level 3*: Deep technical dive and exhaustive section analysis.
- **Contextual RAG Chat**: Chat with documents using precise page and paragraph citations.
- **Knowledge Synthesis**: Automatically generate interactive quizzes, study flashcards, visual mind maps, and searchable study notes.
- **Multilingual Support**: Real-time translation and cross-lingual Q&A across English, Gujarati (ગુજરાતી), and Hindi (हिन्दी).

### 2. 📊 DataInsight (Tabular Data & Analytics)
- **Automated Data Profiling**: Instantly ingest CSV, Excel (`.xlsx`, `.xls`), and Google Sheets exports with instant statistical summaries.
- **Smart Chart Recommendations**: Intelligent heuristic engine that suggests Bar, Line, Scatter, Pie, and Heatmap visualizations based on detected column schemas.
- **Natural Language Q&A**: Ask questions in plain language and receive accurate data insights with full formula and query transparency.
- **Auto-Cleaning & Forecasting**: Detect missing values, impute outliers, standardize formats, and generate lightweight predictive forecasts.

### 3. 🛠️ SmartTools (30+ Utility Suite)
- **PDF Manipulation**: Merge, split, compress, reorder, sign, protect (encrypt/decrypt), watermark, and redact sensitive PII.
- **File Converters**: PDF to Word/PowerPoint/Excel, Image to PDF, PDF to JPG/PNG, Markdown to PDF, and vice versa.
- **OCR & Image Utilities**: Scanned document text extraction, background removal, image upscaling, and receipt/invoice parser.
- **Productivity & QR**: Dynamic QR code generator/scanner, barcode utilities, checksum verifiers, and text diff inspectors.

---

## 🎨 Brand & Design System

- **Primary Brand Colors**:
  - Core Red: `#DC2626` | Dark Red Hover: `#B91C1C`
  - Accent Orange: `#F97316` | Deep Orange Hover: `#EA580C`
- **Dark Mode**: Pitch-black theme (`#000000` background, `#111111` surface, `#262626` border).
- **Light Mode**: Clean minimalist theme (`#FFFFFF` background, `#F5F5F5` surface, `#E5E5E5` border).
- **Typography**:
  - Headings: `Poppins` (Semibold, Bold)
  - Body Text: `Inter`
  - Code & Formulas: `JetBrains Mono`
  - Multilingual: `Noto Sans Gujarati` & `Noto Sans Devanagari` (Line-height >= 1.7 to prevent glyph clipping).

---

## 💻 Tech Stack

### Frontend (`client/`)
- **Framework**: React 18+ via [Vite](https://vitejs.dev/)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Motion & Icons**: Framer Motion (`motion/react`), Lucide React
- **HTTP Client**: Axios
- **Utilities**: `clsx`, `tailwind-merge`

### Backend (`server/`)
- **Runtime**: Node.js (v18+)
- **Web Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose
- **File Ingestion**: Multer
- **Authentication & Security**: JSON Web Tokens (JWT), `bcryptjs`, CORS, Dotenv

---

## 📁 Repository Structure

```
Docify/
├── agent.md                 # System instructions & coding rules
├── README.md                # Comprehensive project documentation
├── .gitignore               # Root git ignore specification
├── client/                  # Frontend React application
│   ├── public/              # Static assets (favicon, manifest)
│   ├── src/
│   │   ├── assets/          # Fonts, icons, static images
│   │   ├── components/      # Common, layout, upload, charts, quiz, flashcards
│   │   ├── context/         # Auth, Theme, and Language contexts
│   │   ├── hooks/           # Custom reusable hooks
│   │   ├── locales/         # i18n translation dictionaries
│   │   ├── pages/           # DocuMind, DataInsight, SmartTools, Admin
│   │   ├── routes/          # Application routing definitions
│   │   ├── services/        # API client and endpoints
│   │   ├── styles/          # Tailwind and global CSS
│   │   └── utils/           # Helper functions & formatters
│   ├── .env.example         # Client environment template
│   ├── package.json         # Client dependencies & scripts
│   ├── tailwind.config.js   # Tailwind theme configurations
│   └── vite.config.js       # Vite build configurations
└── server/                  # Backend Express application
    ├── src/
    │   ├── config/          # DB connection & external configs
    │   ├── controllers/     # Route request handlers
    │   ├── jobs/            # Scheduled background workers (cleanup)
    │   ├── middleware/      # Error handler, auth guards, upload filters
    │   ├── models/          # Mongoose database models
    │   ├── routes/          # Express route definitions
    │   ├── services/        # Business logic & AI abstractions
    │   ├── utils/           # Response wrappers & file helpers
    │   ├── app.js           # Express app setup & middleware stack
    │   └── server.js        # Server entry point & DB bootstrap
    ├── uploads/             # Managed file storage (.gitkeep)
    ├── .env.example         # Server environment template
    └── package.json         # Server dependencies & scripts
```

---

## ⚡ Quickstart & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- MongoDB (local instance running at `mongodb://localhost:27017` or MongoDB Atlas URI)

### 1. Setup Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Setup Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 🗺️ Roadmap & Milestones

- [x] **Phase 1**: Project Foundation, Architecture Setup & Guidelines (`agent.md`).
- [ ] **Phase 2**: Core Authentication, Theme Engine & Multilingual System.
- [ ] **Phase 3**: DocuMind — Ingestion Pipeline, OCR, 3-Level Summarizer & RAG Chat.
- [ ] **Phase 4**: DataInsight — Tabular Profiler, Dynamic Charting & Formula Q&A.
- [ ] **Phase 5**: SmartTools — PDF & Media Utilities Suite (30+ tools).
- [ ] **Phase 6**: Admin Dashboard, Performance Optimization & Production Hardening.

---

## 📜 License

Licensed under the MIT License.
