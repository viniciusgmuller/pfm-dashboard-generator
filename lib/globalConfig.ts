// Global configuration for dashboard data
// This file centralizes all global values used across the application

export type DashboardCategory = 'prop-trading' | 'futures'

export const globalConfig = {
  // Week period displayed in header
  currentWeek: 'Sep 5 - Sep 11',
  
  // Total visitors for the platform (not per company)
  pfmVisitors: 169031,
  
  // Category-specific configurations
  categories: {
    'prop-trading': {
      name: 'Prop Trading',
      csvFile: 'data.csv',
      visitors: 169031,
    },
    'futures': {
      name: 'Futures',
      csvFile: 'datafutures.csv', 
      visitors: 169031, // Using same value as CFD
    }
  },
  
  // Default category
  defaultCategory: 'prop-trading' as DashboardCategory,
}

export default globalConfig