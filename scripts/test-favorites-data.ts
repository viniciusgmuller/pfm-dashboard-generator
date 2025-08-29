#!/usr/bin/env node

import { parseCSV } from './csv-parser'
import path from 'path'

function testFavoritesData() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    console.log('=== Favorites Data from CSV ===')
    
    firms.slice(0, 5).forEach(firm => {
      console.log(`${firm.firmName}:`)
      console.log(`  Previous Week (Column G): ${firm.visitsPinkPrevious.toLocaleString()}`)
      console.log(`  Current Week (Column H): ${firm.visitsPinkCurrent.toLocaleString()}`)
      console.log(`  Favorites Added (Column I): ${firm.favoritesAdded.toLocaleString()}`)
      console.log(`  Favorites Change (Column J): ${firm.favoritesChange}%`)
      
      const changePercentage = firm.visitsPinkPrevious === 0 
        ? (firm.visitsPinkCurrent > 0 ? 100 : 0) 
        : ((firm.visitsPinkCurrent - firm.visitsPinkPrevious) / firm.visitsPinkPrevious) * 100
      console.log(`  Calculated Change: ${changePercentage.toFixed(2)}%`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testFavoritesData()