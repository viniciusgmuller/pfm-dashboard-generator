#!/usr/bin/env node

import { parseCSV } from './csv-parser'
import path from 'path'

function testFormattedCFD() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    console.log('=== CFD Share Formatted Values ===')
    
    firms.slice(0, 5).forEach(firm => {
      console.log(`${firm.firmName}:`)
      console.log(`  cfdShare: ${firm.cfdShare} (${typeof firm.cfdShare})`)
      console.log(`  cfdShareFormatted: "${firm.cfdShareFormatted}" (${typeof firm.cfdShareFormatted})`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testFormattedCFD()