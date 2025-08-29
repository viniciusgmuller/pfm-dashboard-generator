#!/usr/bin/env node

import { parseCSV } from './csv-parser'
import path from 'path'

function testRankingData() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    console.log('=== Ranking Data from CSV ===')
    
    firms.slice(0, 10).forEach(firm => {
      console.log(`${firm.firmName}:`)
      console.log(`  Previous Position (Column B): ${firm.previousPosition}`)
      console.log(`  Current Position (Column C): ${firm.currentPosition}`)
      
      // Calculate direction
      let direction = 'No Change'
      if (firm.previousPosition > firm.currentPosition) {
        direction = `Up +${firm.previousPosition - firm.currentPosition}`
      } else if (firm.previousPosition < firm.currentPosition) {
        direction = `Down -${firm.currentPosition - firm.previousPosition}`
      }
      console.log(`  Direction: ${direction}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testRankingData()