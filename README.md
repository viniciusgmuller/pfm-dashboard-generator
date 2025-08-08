# Prop Firm Analytics Dashboard

## Overview

This project is a **Next.js 14** dashboard application built for tracking and analyzing prop firm performance metrics. The dashboard provides real-time visualization of key performance indicators including revenue generation, traffic visitors, and favorite changes with week-over-week comparisons.

## Project Objectives

### Primary Goals
- **Real-time Analytics**: Display current week vs previous week performance metrics
- **Interactive Data Management**: Allow inline editing of all metric values
- **Visual Data Representation**: Use charts (horizontal bars, vertical bars, bubbles) to represent data
- **Competitive Analysis**: Compare FundingPips against anonymous competitors in rankings
- **Responsive Design**: Ensure optimal viewing across all device sizes

### Key Features
- **PopularityLeaderboard**: Rankings component highlighting FundingPips among top 5 prop firms
- **Revenue Analytics**: Horizontal bar charts comparing weekly revenue performance
- **Traffic Analytics**: Vertical bar charts showing visitor traffic patterns  
- **Favorite Metrics**: Bubble charts displaying favorite count changes
- **Inline Editing**: Click-to-edit functionality on all numeric values
- **Dynamic Calculations**: Automatic percentage change calculations and badge indicators

## Architecture & Technology Stack

### Frontend Framework
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **shadcn/ui** component library

### Key Dependencies
```json
{
  "next": "14.2.8",
  "react": "^18.3.1",
  "tailwindcss": "^3.4.1",
  "lucide-react": "^0.454.0",
  "class-variance-authority": "^0.7.0"
}
```

## Component Structure

### Core Components

#### 1. Header Component
- Displays FundingPips branding
- Shows week selector (Previous Week vs Current Week)
- Displays total metrics (PFM Visits: 258,351 | CFD Visits: 108,346)

#### 2. PopularityLeaderboard Component
- Shows top 5 prop firms ranking
- Highlights FundingPips (position #4) with blue glow effect
- Displays metrics: favorites ❤️, revenue 💰, traffic 🌐
- Anonymous competitors shown as "???"

#### 3. RevenueCard Component
- **Chart Type**: Horizontal bars
- **Data**: Current week vs previous week revenue
- **Colors**: Blue (current) / Purple (previous)
- **Editing**: Click values to edit inline

#### 4. TrafficCard Component  
- **Chart Type**: Vertical bars
- **Data**: Current week vs previous week traffic
- **Colors**: Blue (current) / Purple (previous)
- **Editing**: Click values to edit inline

#### 5. FavoriteCard Component
- **Chart Type**: Bubble chart
- **Data**: Current week vs previous week favorites
- **Colors**: Blue (current) / Purple (previous)
- **Sizing**: Bubble size proportional to values
- **Editing**: Click values to edit inline

## Design Guidelines

### Color Scheme Standards
```css
/* Week Identification Colors */
Blue (#2563eb): Current Week data
Purple (#9333ea): Previous Week data

/* Status Indicators */
Green (#16a34a): Positive performance (+%)
Red (#dc2626): Negative performance (-%)

/* Background Theme */
Dark theme only: Gray-900 to Gray-950 gradients
```

### Layout Specifications
- **Dashboard Max Dimensions**: 1560px width × 850px height
- **Grid System**: 2-column layout (50% each on desktop)
- **Responsive Breakpoints**: Mobile-first approach
- **Card Heights**: 100% vertical fill for optimal space usage

### Interactive Behavior
- **Hover States**: Visual feedback on all interactive elements
- **Edit Mode**: Click values to enable inline editing
- **Keyboard Controls**: Enter (confirm) / Escape (cancel)
- **Real-time Updates**: Charts and percentages update instantly

## Data Flow & State Management

### Component State Structure
```typescript
interface MetricData {
  currentWeek: number
  previousWeek: number
  editing: boolean
}
```

### Calculation Logic
```typescript
// Percentage change calculation
const changePercentage = ((current - previous) / previous) * 100

// Chart sizing (bars/bubbles)
const maxValue = Math.max(current, previous)
const proportion = (value / maxValue) * 100
```

## Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled, full type safety
- **Component Pattern**: Functional components with hooks
- **Styling**: TailwindCSS classes, no inline styles except dynamic values
- **State Management**: React useState for component-level state
- **File Structure**: Components in `/components/`, utilities in `/lib/`

### Editing Implementation
```typescript
// Standard editing pattern for all components
const [editing, setEditing] = useState(false)
const [value, setValue] = useState(initialValue)

const handleEdit = (input: string) => {
  const numValue = parseInt(input.replace(/[^\d]/g, '')) || 0
  setValue(numValue)
}
```

### Animation Standards
- **Transitions**: 1000ms duration for smooth chart updates
- **Easing**: `ease-out` for natural motion
- **Performance**: Use CSS transforms for optimal rendering

## Deployment & Environment

### Build Configuration
- **Framework**: Next.js with static optimization
- **Build Target**: Modern browsers (ES2020+)
- **CSS Processing**: PostCSS with Autoprefixer
- **Type Checking**: Build-time TypeScript validation

### Environment Setup
```bash
# Development
npm run dev     # http://localhost:3000

# Production
npm run build
npm run start
```

## Important Notes for AI/Developer

### Critical Requirements
1. **Color Consistency**: Always use Blue for current week, Purple for previous week
2. **Editing Functionality**: Every numeric value must be click-to-edit
3. **Real-time Updates**: Charts and percentages must update immediately when values change
4. **Responsive Design**: Components must work on all screen sizes
5. **Dark Theme Only**: No light theme implementation needed

### Data Handling
- **Number Formatting**: Use `Intl.NumberFormat('en-US')` for consistent formatting
- **Currency Display**: Revenue shows as `$XXX,XXX` format
- **Validation**: Input parsing removes non-numeric characters
- **Error Handling**: Fallback to 0 for invalid inputs

### Performance Considerations
- **Animation Optimization**: Use CSS transitions over JavaScript animations
- **State Updates**: Batch related state changes when possible
- **Component Re-renders**: Minimize unnecessary re-renders with proper state structure

### Accessibility
- **Keyboard Navigation**: Full keyboard support for editing
- **Visual Feedback**: Clear hover and focus states
- **Screen Readers**: Semantic HTML structure with proper labels

This dashboard serves as a comprehensive analytics tool for prop firm performance monitoring with emphasis on intuitive data interaction and visual clarity.