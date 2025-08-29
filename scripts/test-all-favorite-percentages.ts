#!/usr/bin/env node

import { parseCSV } from './csv-parser'
import path from 'path'

function testAllFavoritePercentages() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    console.log('=== All Favorite Percentages Comparison ===')
    
    firms.slice(0, 10).forEach(firm => {
      const csvPercentage = firm.favoritesChange
      const calculatedPercentage = firm.visitsPinkPrevious === 0 
        ? (firm.visitsPinkCurrent > 0 ? 100 : 0) 
        : ((firm.visitsPinkCurrent - firm.visitsPinkPrevious) / firm.visitsPinkPrevious) * 100
      
      console.log(`${firm.firmName}:`)
      console.log(`  CSV (Column J): ${csvPercentage}%`)
      console.log(`  Calculated: ${calculatedPercentage.toFixed(2)}%`)
      console.log(`  Match: ${Math.abs(csvPercentage - calculatedPercentage) < 0.1 ? '✅' : '❌'}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testAllFavoritePercentages()