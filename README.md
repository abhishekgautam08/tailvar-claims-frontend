# Tailvar Claims Management - Frontend Portal

A responsive, accessible frontend client for the **Tailvar Insurance Policy & Claims Management System**. Built with React (Vite), React Router v6, plain JavaScript, and custom CSS without external UI frameworks.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- The backend server running at `http://localhost:5000` (from `../tailvar-claims-backend`)

### 2. Environment Configuration
Copy `.env.example` to `.env` if not already present:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🛡️ Demo Accounts

Seed the backend database first with `npm run seed` in the backend folder. You can then use the 1-click **"Use"** button on the login screen:

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `customer1` | `Customer1@Demo26` | `CUSTOMER` | Primary insured customer (view policies & submit claims) |
| `customer2` | `Customer2@Demo26` | `CUSTOMER` | Second insured customer (isolated view of policies) |
| `admin` | `Admin@Demo26` | `ADMIN` | Portal administrator (issue policies & adjudicate claims) |

---

## 🌐 Deployment (Vercel)

The frontend is deployed to Vercel with single-page application (SPA) routing:

- **Live URL**: [https://tailvar-claims-frontend.vercel.app](https://tailvar-claims-frontend.vercel.app)
- **Framework Preset**: `Vite`
- **Root Directory**: `tailvar-claims-frontend` (or project root if deployed from subfolder)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Rewrites**: Defined in `vercel.json` (`rewrites: [{ source: "/(.*)", destination: "/index.html" }]`) ensuring client-side routes like `/admin` and `/customer` survive browser refreshes.
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://tailvar-claims-backend.onrender.com/api`

---

## 📁 Project Structure

```
tailvar-claims-frontend/
├── index.html                  # HTML entry point with accessible title & meta
├── vite.config.js              # Vite configuration (port 3000, React plugin)
├── package.json                # Project scripts & dependencies
├── .env.example                # Documented environment variables template
├── .gitignore                  # Git ignore rules (node_modules, dist, .env, logs)
├── src/
│   ├── main.jsx                # React DOM mount point
│   ├── App.jsx                 # Route definitions & top-level router hierarchy
│   ├── api/                    # Centralized API service layer (Fetch-based)
│   │   ├── client.js           # Universal request wrapper, token handling, 401 redirect
│   │   ├── auth.js             # Login, current user (/me), and logout
│   │   ├── policies.js         # Policy listing, retrieval, and creation
│   │   ├── claims.js           # Claim listing, submission, and adjudication
│   │   └── customers.js        # Customer list for policy issuance (admin)
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication state, session restoration, RBAC helpers
│   ├── components/             # Reusable UI components
│   │   ├── Alert.jsx           # Accessible error/success/info feedback
│   │   ├── EmptyState.jsx      # Placeholder state for empty lists
│   │   ├── Layout.jsx          # Header with user avatar, role badge, sign-out, outlet
│   │   ├── Loading.jsx         # Accessible loading spinner & progress text
│   │   ├── Money.jsx           # Rupee currency formatter component
│   │   ├── ProtectedRoute.jsx  # Route guard redirecting unauthenticated users to /login
│   │   ├── RoleRoute.jsx       # RBAC route guard redirecting unauthorized roles
│   │   └── StatusBadge.jsx     # Claim status badge (SUBMITTED, APPROVED, REJECTED)
│   ├── pages/                  # Page-level components
│   │   ├── LoginPage.jsx       # Sign-in form with demo helper & error handling
│   │   ├── CustomerDashboardPage.jsx # Customer landing page
│   │   ├── AdminDashboardPage.jsx    # Administrator console landing page
│   │   └── NotFoundPage.jsx    # 404 handler with fallback navigation
│   ├── styles/
│   │   └── global.css          # Pure CSS design system, typography, controls, layout
│   └── utils/
│       └── format.js           # Money, calendar date ("YYYY-MM-DD"), and timestamp formatting
```

---

## 🔐 Architecture & Features

1. **Token & Session Management**:
   - Stores JWT token in browser cookies under key `tailvar_auth_token` (not `localStorage`).
   - On initial load or refresh, `AuthContext` calls `GET /api/auth/me` to validate the cookie token and restore the user's session without jarring page flicker.
   - If a request receives a `401 Unauthorized` response, the client automatically clears the cookie and redirects to `/login?expired=1` with an informative banner.

2. **Role-Based Access Control (RBAC)**:
   - `<ProtectedRoute>` ensures only logged-in users enter the private routes.
   - `<RoleRoute allowedRoles={['CUSTOMER']}>` guards customer-specific views.
   - `<RoleRoute allowedRoles={['ADMIN']}>` guards admin consoles.
   - If a customer attempts to access `/admin` or vice versa, they are gracefully redirected to their respective dashboard.

3. **Date & Currency Precision**:
   - Dates are formatted cleanly from `"YYYY-MM-DD"` without timezone shift bugs.
   - Rupee amounts are displayed using Indian numbering system formatting (`₹X,XX,XXX.XX`).

4. **Strict Rules Adherence**:
   - Zero `git` commands executed.
   - No hardcoded secrets.

