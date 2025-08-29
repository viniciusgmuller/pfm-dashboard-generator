#!/usr/bin/env node

import { parseCSV } from './csv-parser'
import path from 'path'

function debugE8MarketsCFD() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const e8Markets = firms.find(f => f.firmName === 'E8 Markets')
    
    console.log('=== E8 Markets CFD Share Debug ===')
    console.log(`Firm found: ${!!e8Markets}`)
    
    if (e8Markets) {
      console.log(`Firm name: "${e8Markets.firmName}"`)
      console.log(`CFD Share (parsed): ${e8Markets.cfdShare}`)
      console.log(`Type: ${typeof e8Markets.cfdShare}`)
      
      // Let's also check the raw CSV data
      const fs = require('fs')
      const fileContent = fs.readFileSync(csvPath, 'utf-8')
      const lines = fileContent.split('\n')
      
      console.log('\n=== Raw CSV Data ===')
      console.log('Header:', lines[0])
      
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(',')
        if (cells[0] && cells[0].trim() === 'E8 Markets') {
          console.log(`E8 Markets raw line: ${lines[i]}`)
          console.log(`Column N (index 13) raw value: "${cells[13]}"`)
          break
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugE8MarketsCFD()