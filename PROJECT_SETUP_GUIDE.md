# Society Management System - Complete Setup Guide

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for version control)
- **Code Editor** (VS Code recommended)

## 🚀 Frontend Setup (React + TypeScript + Tailwind)

### Step 1: Clone or Download Project
```bash
# If using Git
git clone <your-repository-url>
cd sms-front

# Or if you have the project folder
cd path/to/your/project
```

### Step 2: Install Dependencies
```bash
# Install all required packages
npm install

# Or if you prefer yarn
yarn install
```

### Step 3: Verify Package Installation
Check that these key packages are installed:
```bash
npm list react react-dom react-router-dom lucide-react tailwindcss
```

### Step 4: Start Development Server
```bash
# Start the development server
npm run dev

# Or with yarn
yarn dev
```

The application will be available at `http://localhost:5173`

## 📦 Package Dependencies Explained

### Core React Dependencies
```json
{
  "react": "^18.3.1",           // React library
  "react-dom": "^18.3.1",      // React DOM rendering
  "react-router-dom": "^7.8.2" // Client-side routing
}
```

### UI and Styling
```json
{
  "lucide-react": "^0.344.0",  // Icon library
  "tailwindcss": "^3.4.1",     // CSS framework
  "autoprefixer": "^10.4.18",  // CSS vendor prefixes
  "postcss": "^8.4.35"         // CSS processing
}
```

### Development Tools
```json
{
  "typescript": "^5.5.3",      // TypeScript compiler
  "vite": "^5.4.2",           // Build tool and dev server
  "@vitejs/plugin-react": "^4.3.1", // Vite React plugin
  "eslint": "^9.9.1"          // Code linting
}
```

### PDF Generation (Optional)
```json
{
  "html2canvas": "^1.4.1",    // HTML to canvas conversion
  "jspdf": "^3.0.2"          // PDF generation
}
```

## 🛠️ Configuration Files

### 1. Tailwind CSS Configuration (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

### 2. PostCSS Configuration (`postcss.config.js`)
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 3. Vite Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### 4. TypeScript Configuration (`tsconfig.json`)
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

## 🎨 CSS Setup (`src/index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Admin/              # Admin panel components
│   ├── Common/             # Reusable components
│   ├── Layout/             # Header, Footer
│   └── Registration/       # Registration form steps
├── contexts/               # React contexts
├── pages/                  # Page components
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── App.tsx                 # Main app component
├── main.tsx               # App entry point
└── index.css              # Global styles
```

## 🔧 Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Package Management
```bash
npm install <package>     # Install new package
npm uninstall <package>   # Remove package
npm update               # Update all packages
npm audit                # Check for vulnerabilities
```

## 🐛 Troubleshooting

### 1. PostCSS/Tailwind Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 2. TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

### 3. Build Issues
```bash
# Clear Vite cache
rm -rf dist .vite
npm run build
```

### 4. Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or start on different port
npm run dev -- --port 3000
```

## 🔗 Backend Integration

### Environment Variables (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_BACKEND_URL=http://localhost:8080
```

### API Service Example (`src/services/api.ts`)
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiService = {
  // Societies
  getSocieties: () => fetch(`${API_BASE}/societies/public`),
  registerSociety: (data: any) => fetch(`${API_BASE}/societies/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  // Events
  submitEventPermission: (data: any) => fetch(`${API_BASE}/events/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  // Admin endpoints (with authentication)
  getAdminDashboard: (token: string) => fetch(`${API_BASE}/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
};
```

## 📱 Features Included

### ✅ Frontend Features
- **Multi-step Registration Form** with validation
- **Society Renewal Process** with previous activities
- **Event Permission Requests** with comprehensive details
- **Admin Panel** with role-based access
- **Society Explorer** with search and filters
- **Email Validation** throughout forms
- **Responsive Design** for all devices
- **Activity Logging** for audit trails

### ✅ UI Components
- **Form Fields** with validation
- **Step Indicators** for multi-step forms
- **Email Validation Indicators** for real-time feedback
- **Admin Dashboard** with statistics
- **Data Tables** with sorting and pagination
- **Modal Dialogs** for detailed views

### ✅ Styling Features
- **Tailwind CSS** utility classes
- **Custom animations** (fade-in, slide-up)
- **Responsive breakpoints** for mobile/tablet/desktop
- **Color system** with consistent theming
- **Hover states** and micro-interactions

## 🎯 Quick Start Commands

```bash
# 1. Navigate to project directory
cd your-project-folder

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:5173
```

## 🔄 Integration with Spring Boot Backend

When ready to connect to your Spring Boot backend:

1. **Update DataContext** to use API calls instead of localStorage
2. **Add authentication** with JWT tokens
3. **Configure CORS** in your Spring Boot application
4. **Set environment variables** for API endpoints
5. **Handle loading states** and error handling

Your frontend is now ready to work with the Spring Boot backend you've already implemented!

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all dependencies are installed correctly
3. Ensure Node.js version is 18 or higher
4. Clear browser cache and restart dev server

The project is production-ready with proper validation, responsive design, and clean architecture!