# Docify (SmartDataAbstract AI) — Agent & Developer System Guidelines

Welcome to the **Docify** engineering codebase. This document outlines the non-negotiable architectural standards, design systems, coding patterns, security mandates, and testing protocols required for every feature, module, or bugfix in Docify.

---

## 1. Project Overview & Core Modules

Docify is an all-in-one AI-powered document intelligence and analytics suite comprising three core modules:
1. **DocuMind**: PDF/DOCX/TXT text extraction, OCR, 3-level abstraction (executive summary, key takeaways, deep dive), RAG chat with page citation, quizzes, flashcards, mind maps, notes, and multilingual support (English, Gujarati, Hindi).
2. **DataInsight**: CSV/Excel/Sheets tabular analytics, automatic chart suggestions, natural language Q&A with formula/query transparency, auto-cleaning, data profiling, and statistical forecasting.
3. **SmartTools**: 30+ document and file processing utilities (PDF merge/split/compress/sign/protect/redact, converters, image/OCR tools, AI utility tools, QR codes).

---

## 2. Design System & UI/UX Standards

### 2.1 Theme & Color Palette
- **Brand Identity**:
  - Primary Red: `#DC2626` (`red-600`) | Hover: `#B91C1C` (`red-700`)
  - Accent Orange: `#F97316` (`orange-500`) | Hover: `#EA580C` (`orange-600`)
- **Dark Mode (Default-Ready)**:
  - Background: `#000000` (true pitch black)
  - Surface / Cards: `#111111`
  - Border: `#262626`
  - Text Primary: `#F9FAFB` (`gray-50`)
  - Text Secondary: `#9CA3AF` (`gray-400`)
  - Bright Red Accent: `#EF4444` (`red-500`)
  - Bright Orange Accent: `#FB923C` (`orange-400`)
- **Light Mode**:
  - Background: `#FFFFFF`
  - Surface / Cards: `#F5F5F5`
  - Border: `#E5E5E5`
  - Headings / Strong: `#0A0A0A`
  - Text Primary: `#404040`

### 2.2 Styling Strategy
- **Tailwind-First**: Style exclusively with Tailwind CSS utility classes and design tokens defined in `tailwind.config.js`.
- **No Conflicting CSS**: Never import heavy global CSS frameworks (like Bootstrap) that conflict with Tailwind's reset and cascade.
- **Dark Mode Strategy**: Implement dark mode via the `class` strategy (`darkMode: 'class'`). Use explicit `dark:` modifiers for colors, borders, and surfaces.
- **Spacing & Layout**:
  - Base spacing on an 8px grid (`p-2`, `p-4`, `p-6`, `p-8`, `gap-4`, `gap-6`).
  - Container padding and responsive grids for all device breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`).
- **Surfaces & Elevation**:
  - Rounded corners: `rounded-xl` (12px) for cards, dialogs, and controls; `rounded-2xl` (16px) for major panels and modal containers.
  - Soft, modern shadows: subtle border glows or soft drop shadows (`shadow-sm`, `shadow-md`, `dark:border-border-dark`).

### 2.3 Typography & Multilingual Guidelines
- **Headings**: `Poppins`, sans-serif (`font-heading`, `font-semibold` / `font-bold`).
- **Body & Controls**: `Inter`, sans-serif (`font-sans`).
- **Code & Formulas**: `JetBrains Mono`, monospace (`font-mono`).
- **Multilingual Scripts**:
  - Gujarati: `Noto Sans Gujarati`, sans-serif (`font-gujarati`).
  - Hindi / Devanagari: `Noto Sans Devanagari`, sans-serif (`font-devanagari`).
- **Line Heights**:
  - English body: `leading-relaxed` (1.6).
  - Gujarati & Hindi scripts: Must use `leading-[1.75]` or greater to avoid glyph ascender/descender clipping on complex conjuncts.

### 2.4 Accessibility (a11y)
- **Contrast**: Maintain WCAG AA standard contrast ratio >= 4.5:1 for normal text and >= 3:1 for large headings across both light and dark themes.
- **Focus Rings**: All interactive elements (buttons, inputs, links) must provide visible, high-contrast keyboard focus indicators (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`).
- **Status Indicators**: Never rely on color alone for states (success, warning, error, info). Always pair colors with clear text labels or Lucide icons with appropriate `aria-label` or screen-reader annotations.

---

## 3. Code Quality & Architecture Rules

### 3.1 Strict Separation of Concerns
```
client/src/
├── components/common/   # Reusable atomic UI (Button, Input, Modal, Badge, Dropzone)
├── components/layout/   # Navbar, Sidebar, Footer, PageWrapper
├── context/             # Global states (AuthContext, ThemeContext, LanguageContext)
├── hooks/               # Custom reusable logic (useAuth, useUpload, useDebounce, etc.)
├── pages/               # Route-level views (DocuMind, DataInsight, SmartTools, Admin)
├── services/            # Pure API communication layer (Axios instances & endpoints)
├── styles/              # Global styles, Tailwind directives, font imports
└── utils/               # Formatting, validation, constants, helper functions
```

```
server/src/
├── config/              # Database (Mongoose), env validation, external service configs
├── controllers/         # Request handling, validation, delegating to services
├── jobs/                # Background routines (temp file cleanup, cron schedules)
├── middleware/          # Auth guards, role checks, upload handlers, error handling
├── models/              # Mongoose schemas and data models
├── routes/              # Express route declarations mapped to controllers
├── services/            # Core business logic, LLM integrations, document processors
└── utils/               # Standard response wrappers, logger, file helpers
```

- **API Encapsulation**: Frontend components must never call `fetch()` or `axios.get()` directly. All HTTP requests must be encapsulated within modular methods in `client/src/services/`.
- **Controller Purity**: Express controllers must only unpack requests, invoke business logic from `server/src/services/`, and return standardized responses.
- **Standardized Backend Responses**: Every API endpoint must return JSON adhering to this envelope:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Operation completed successfully"
  }
  ```
  On failure:
  ```json
  {
    "success": false,
    "message": "Descriptive user-facing error message",
    "error": "Detailed diagnostic information (development only)"
  }
  ```

---

## 4. State Management & Hooks Pattern

1. **Central Context**:
   - `AuthContext`: Token management, authenticated user profile, login/logout, session expiry.
   - `ThemeContext`: Persistent dark/light mode toggle via `localStorage` and `document.documentElement.classList`.
   - `LanguageContext`: Active language state (`en`, `gu`, `hi`), script classes, and localization strings.
2. **Custom Hooks**:
   - Encapsulate side effects and shared workflows into dedicated hooks: `useAuth`, `useUpload`, `useDebounce`, `useLocalStorage`, `useDocumentViewer`.

---

## 5. Security & File Handling Standards

- **Secret Protection**: Never commit `.env` files or expose server secrets (`JWT_SECRET`, OpenAI/Gemini/Anthropic keys) to the client. Vite variables must strictly use the `VITE_` prefix and contain only public configuration (e.g., `VITE_API_BASE_URL`).
- **File Upload Security**:
  - Accept uploads strictly via configured `multer` middleware.
  - Validate MIME types against allowed whitelist (`application/pdf`, `image/png`, `text/csv`, etc.) and enforce maximum file sizes (e.g., 25MB).
  - Store temporary files with cryptographically random filenames (`uuidv4()`).
- **Automated Cleanup**:
  - All temporary and processing files placed in `server/uploads/` must be cleaned up via background jobs (`server/src/jobs/cleanupJob.js`) or post-processing hooks to avoid disk bloat.
- **Input Sanitization**: Validate request payloads using schema validation or explicit guards before querying databases or invoking AI models.

---

## 6. Testing & Execution Protocol

Before marking any task, feature, or pull request complete:
1. **Zero Warnings/Errors**: Ensure both Vite dev server (`npm run dev`) and Node/Express backend boot cleanly with zero terminal errors, unresolved imports, or unhandled promise rejections.
2. **Lint & Build Integrity**: Ensure `npm run build` succeeds without syntax errors, missing asset paths, or broken typescript/javascript types.
3. **Browser Console Health**: Ensure no uncaught exceptions, React key warnings, or 404 resource loads appear in the browser developer console.
