# 🎨 EnviroGuard Frontend - Complete Documentation

**Version**: 1.0.0  
**Framework**: React 18 + Vite 8  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Project Structure](#project-structure)
4. [Pages](#pages)
5. [Components](#components)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Styling](#styling)
9. [Deployment](#deployment)

---

## Overview

The EnviroGuard frontend is a modern React single-page application built with Vite, providing an intuitive interface for industrial emission monitoring and analysis.

### Key Features
- ✅ 6 interactive pages
- ✅ 11 reusable components
- ✅ Real-time data visualization
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Global state management
- ✅ Interactive charts
- ✅ File upload with drag-and-drop
- ✅ Professional UI/UX

---

## Installation

### Prerequisites
```bash
Node.js 18+
npm or yarn
```

### Install Dependencies
```bash
cd frontend
npm install
```

**Key Dependencies**:
- react - UI library
- react-router-dom - Routing
- axios - HTTP client
- recharts - Charts
- lucide-react - Icons
- tailwindcss - Styling

### Start Development Server
```bash
npm run dev
```

**Server URL**: http://localhost:5173

### Build for Production
```bash
npm run build
```

Output in `dist/` folder

---

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── apiClient.js          # API integration
│   ├── components/
│   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   ├── Topbar.jsx             # Header bar
│   │   ├── EmissionCard.jsx       # Emission display
│   │   ├── ComplianceGauge.jsx    # Circular gauge
│   │   ├── RiskVsTarget.jsx       # Bar chart
│   │   ├── TrendChart.jsx         # Line chart
│   │   ├── SeverityChart.jsx      # Severity bars
│   │   ├── RankingTable.jsx       # Sortable table
│   │   ├── Loader.jsx             # Loading spinner
│   │   ├── AlertBadge.jsx         # Status badge
│   │   └── ConfidenceBadge.jsx    # Confidence badge
│   ├── pages/
│   │   ├── Landing.jsx            # Landing page
│   │   ├── Upload.jsx             # File upload
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── CounterMeasures.jsx    # Mitigation
│   │   ├── Ranking.jsx            # Industry ranking
│   │   └── Guidelines.jsx         # Regulatory info
│   ├── context/
│   │   └── AppContext.jsx         # Global state
│   ├── App.jsx                    # Main app
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── public/                        # Static assets
├── index.html                     # HTML template
├── vite.config.js                 # Vite config
├── tailwind.config.js             # Tailwind config
├── postcss.config.js              # PostCSS config
└── package.json                   # Dependencies
```

---

## Pages

### 1. Landing Page (`/`)
**File**: `src/pages/Landing.jsx`

**Features**:
- Hero section with call-to-action
- Feature highlights
- Navigation to upload page

**Route**: `/`

---

### 2. Upload Page (`/upload`)
**File**: `src/pages/Upload.jsx`

**Features**:
- Drag-and-drop file upload
- File validation (CSV only)
- Progress indicator
- Error handling

**Route**: `/upload`

**Usage**:
```jsx
// Upload CSV file
// Wait for processing
// Auto-redirect to dashboard
```

---

### 3. Dashboard (`/dashboard`)
**File**: `src/pages/Dashboard.jsx`

**Features**:
- 4 emission cards (CO2, SO2, BOD, COD)
- Compliance gauge
- Risk vs target chart
- Severity ranking chart
- Trend analysis chart
- Summary statistics

**Route**: `/dashboard`

**Layout**:
```
┌─────────────────────────────────────┐
│ CO2  │ SO2  │ BOD  │ COD  │ Gauge  │
├─────────────────────────────────────┤
│ Risk vs Target │ Severity Ranking   │
├─────────────────────────────────────┤
│ Trend Chart                         │
├─────────────────────────────────────┤
│ Summary Statistics                  │
└─────────────────────────────────────┘
```

---

### 4. Counter Measures (`/dashboard/counter`)
**File**: `src/pages/CounterMeasures.jsx`

**Features**:
- Current status display
- Primary driver identification
- Recommended actions
- Mitigation impact projection
- Scenario simulation form
- Before/after comparison chart

**Route**: `/dashboard/counter`

---

### 5. Ranking (`/dashboard/ranking`)
**File**: `src/pages/Ranking.jsx`

**Features**:
- Sortable industry table
- Filter by alert level
- Search functionality
- Summary statistics

**Route**: `/dashboard/ranking`

---

### 6. Guidelines (`/dashboard/guidelines`)
**File**: `src/pages/Guidelines.jsx`

**Features**:
- Regulatory limits table
- Composite weights
- Alert level definitions
- Category thresholds
- Quality level indicators

**Route**: `/dashboard/guidelines`

---

## Components

### Navigation Components

#### Sidebar
**File**: `src/components/Sidebar.jsx`

**Props**:
- `isOpen` (boolean) - Sidebar visibility
- `onClose` (function) - Close handler

**Features**:
- Collapsible on mobile
- Active route highlighting
- Navigation links

---

#### Topbar
**File**: `src/components/Topbar.jsx`

**Props**:
- `onMenuClick` (function) - Menu toggle handler

**Features**:
- Industry selector
- Upload button
- Menu toggle (mobile)

---

### Data Display Components

#### EmissionCard
**File**: `src/components/EmissionCard.jsx`

**Props**:
```jsx
<EmissionCard
  pollutant="CO2"
  value={4500}
  riskPercentage={90}
  unit="kg"
/>
```

**Features**:
- Color-coded by risk level
- Icon display
- Risk percentage indicator

---

#### ComplianceGauge
**File**: `src/components/ComplianceGauge.jsx`

**Props**:
```jsx
<ComplianceGauge
  compositeIndex={0.752}
  alertLevel="Critical"
  confidence={87.5}
  regulatoryCategory="Risk"
/>
```

**Features**:
- Circular progress gauge
- Color-coded by alert level
- Confidence display

---

#### RiskVsTarget
**File**: `src/components/RiskVsTarget.jsx`

**Props**:
```jsx
<RiskVsTarget riskData={risk_vs_target} />
```

**Features**:
- Horizontal bar chart
- Limit comparison
- Color-coded bars

---

#### TrendChart
**File**: `src/components/TrendChart.jsx`

**Props**:
```jsx
<TrendChart industryId="IND001" />
```

**Features**:
- Line chart with API integration
- Historical data display
- Trend direction indicator

---

#### SeverityChart
**File**: `src/components/SeverityChart.jsx`

**Props**:
```jsx
<SeverityChart severityRanking={severity_ranking} />
```

**Features**:
- Vertical bar chart
- Pollutant severity ranking
- Percentage display

---

#### RankingTable
**File**: `src/components/RankingTable.jsx`

**Props**:
```jsx
<RankingTable ranking={ranking_data} />
```

**Features**:
- Sortable columns
- Filter by alert level
- Pagination support

---

### Utility Components

#### Loader
**File**: `src/components/Loader.jsx`

**Props**:
```jsx
<Loader message="Loading..." />
```

**Features**:
- Spinning animation
- Custom message
- Centered display

---

#### AlertBadge
**File**: `src/components/AlertBadge.jsx`

**Props**:
```jsx
<AlertBadge level="Critical" />
```

**Features**:
- Color-coded by level
- Low/Moderate/Critical variants

---

#### ConfidenceBadge
**File**: `src/components/ConfidenceBadge.jsx`

**Props**:
```jsx
<ConfidenceBadge confidence={87.5} />
```

**Features**:
- Percentage display
- Color-coded by confidence level

---

## State Management

### AppContext
**File**: `src/context/AppContext.jsx`

**Global State**:
```javascript
{
  predictionData: null,        // Prediction results
  selectedIndustry: null,      // Current industry ID
  rankingData: null,           // Ranking data
  guidelinesData: null,        // Guidelines data
  loading: false,              // Loading state
  error: null,                 // Error message
  uploadedFilename: null       // Uploaded file name
}
```

**Usage**:
```jsx
import { useApp } from '../context/AppContext';

function MyComponent() {
  const { predictionData, setPredictionData } = useApp();
  
  // Use state...
}
```

---

## API Integration

### API Client
**File**: `src/api/apiClient.js`

**Configuration**:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

**Methods**:
```javascript
// Health check
api.health()

// Upload and predict
api.predict(file)

// Run simulation
api.simulate(datasetFilename, modifications)

// Get ranking
api.getRanking()

// Get trend
api.getTrend(industryId)

// Get guidelines
api.getGuidelines()
```

**Usage Example**:
```jsx
import { api } from '../api/apiClient';

async function uploadFile(file) {
  try {
    const response = await api.predict(file);
    if (response.data.success) {
      console.log(response.data.data);
    }
  } catch (error) {
    console.error(error.message);
  }
}
```

**Error Handling**:
- Automatic error interception
- User-friendly error messages
- Network error detection

---

## Styling

### TailwindCSS
**File**: `tailwind.config.js`

**Custom Colors**:
```javascript
colors: {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    // ... green shades
    900: '#14532d',
  }
}
```

**Custom Classes** (`src/index.css`):
```css
.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  padding: 1.5rem;
}

.btn-primary {
  background-color: rgb(22 163 74);
  color: white;
  /* ... */
}
```

---

## Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000
```

Update `apiClient.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

---

## Performance Optimization

### Code Splitting
```jsx
// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### Image Optimization
- Use WebP format
- Lazy load images
- Optimize SVG icons

### Bundle Size
- Current: ~500KB (gzipped)
- Target: < 1MB

---

## Responsive Design

### Breakpoints
```javascript
// Mobile: < 768px
// Tablet: 768px - 1024px
// Desktop: > 1024px
```

### Mobile Optimizations
- Collapsible sidebar
- Stacked cards
- Touch-friendly buttons
- Horizontal scroll for tables

---

## Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 5174
```

### Build Fails
```bash
# Clear cache
rm -rf node_modules
npm install
npm run build
```

### Hot Reload Not Working
```bash
# Restart dev server
npm run dev
```

---

## Scripts

```json
{
  "dev": "vite",                    // Start dev server
  "build": "vite build",            // Build for production
  "preview": "vite preview",        // Preview production build
  "lint": "eslint ."                // Run linter
}
```

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: February 12, 2026

© 2024 EnviroGuard Frontend
