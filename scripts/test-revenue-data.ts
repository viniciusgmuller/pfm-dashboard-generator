#!/usr/bin/env node

import { parseCSV } from './csv-parser'
import path from 'path'

function testRevenueData() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    console.log('=== Revenue Data from CSV ===')
    
    firms.slice(0, 5).forEach(firm => {
      console.log(`${firm.firmName}:`)
      console.log(`  Previous Week (Column D): $${firm.revenuePrevious.toLocaleString()}`)
      console.log(`  Current Week (Column E): $${firm.revenueCurrent.toLocaleString()}`)
      
      const changePercentage = ((firm.revenueCurrent - firm.revenuePrevious) / firm.revenuePrevious) * 100
      console.log(`  Percentage Change: ${changePercentage.toFixed(2)}%`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testRevenueData()