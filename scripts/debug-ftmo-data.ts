#!/usr/bin/env node

import { parseCSV } from './csv-parser'
import path from 'path'

function debugFTMOData() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const ftmo = firms.find(f => f.firmName === 'FTMO')
    
    console.log('=== FTMO Data Debug ===')
    if (ftmo) {
      console.log(`Firm name: "${ftmo.firmName}"`)
      console.log(`Previous Position: ${ftmo.previousPosition}`)
      console.log(`Current Position: ${ftmo.currentPosition}`)
      console.log(`Revenue Previous (Column D): ${ftmo.revenuePrevious}`)
      console.log(`Revenue Current (Column E): ${ftmo.revenueCurrent}`)
      console.log(`Revenue Change: ${ftmo.revenueChange}%`)
      
      // Check raw CSV data
      const fs = require('fs')
      const fileContent = fs.readFileSync(csvPath, 'utf-8')
      const lines = fileContent.split('\n')
      
      console.log('\n=== Raw CSV Data ===')
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(',')
        if (cells[0] && cells[0].trim() === 'FTMO') {
          console.log(`FTMO raw line: ${lines[i]}`)
          console.log(`Column D (index 3): "${cells[3]}"`)
          console.log(`Column E (index 4): "${cells[4]}"`)
          break
        }
      }
    } else {
      console.log('FTMO not found in CSV data')
      console.log('Available firms:')
      firms.forEach(f => console.log(`- ${f.firmName}`))
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugFTMOData()