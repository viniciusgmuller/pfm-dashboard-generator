import { readFileSync } from 'fs'
import path from 'path'
import { parseCSVContent } from '../lib/csv-utils'
import { globalConfig } from '../lib/globalConfig'

console.log('Testing Category Data Loading...\n')

// Test both categories
const categories = ['prop-trading', 'futures'] as const

categories.forEach(category => {
  console.log(`\n=== Testing ${category.toUpperCase()} ===`)
  console.log(`Category Name: ${globalConfig.categories[category].name}`)
  console.log(`CSV File: ${globalConfig.categories[category].csvFile}`)
  console.log(`Total Visitors: ${globalConfig.categories[category].visitors.toLocaleString()}`)
  
  try {
    const csvPath = path.join(process.cwd(), 'data', 'weekly', globalConfig.categories[category].csvFile)
    const csvContent = readFileSync(csvPath, 'utf-8')
    const data = parseCSVContent(csvContent)
    
    console.log(`\nLoaded ${data.length} firms:`)
    
    // Show first 5 firms
    data.slice(0, 5).forEach(firm => {
      console.log(`  - ${firm.firmName} (Position: ${firm.currentPosition}, Revenue: $${firm.revenueCurrent.toLocaleString()})`)
    })
    
    if (data.length > 5) {
      console.log(`  ... and ${data.length - 5} more firms`)
    }
    
  } catch (error) {
    console.error(`Error loading ${category} data:`, error)
  }
})

console.log('\n✅ Category data test complete!')