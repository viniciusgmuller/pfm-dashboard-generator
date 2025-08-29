#!/usr/bin/env node

import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

function debugRawParsing() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    
    const records = parse(fileContent, {
      columns: false,
      skip_empty_lines: true,
      from_line: 2,
      quote: '"',
      delimiter: ',',
      escape: '"'
    })
    
    console.log('=== Properly Parsed E8 Markets ===')
    const e8Row = records.find((row: string[]) => row[0] === 'E8 Markets')
    
    if (e8Row) {
      console.log('Row length:', e8Row.length)
      e8Row.forEach((cell, index) => {
        const columnLetter = String.fromCharCode(65 + index)
        console.log(`  Column ${columnLetter} (${index}): "${cell}"`)
      })
      
      // Find the CFD Share value
      const cfdShareValue = e8Row[e8Row.length - 1] // Last column should be % Share
      console.log(`\nCFD Share value: "${cfdShareValue}"`)
      
      const parsed = parseFloat(cfdShareValue.replace(/%/g, '')) || 0
      console.log(`Parsed as number: ${parsed}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugRawParsing()