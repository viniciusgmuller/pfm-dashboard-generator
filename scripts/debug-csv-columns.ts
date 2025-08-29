#!/usr/bin/env node

import path from 'path'

function debugCSVColumns() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const fs = require('fs')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = fileContent.split('\n')
    
    console.log('=== CSV Column Analysis ===')
    const headers = lines[0].split(',')
    console.log('Headers:')
    headers.forEach((header, index) => {
      console.log(`  Column ${String.fromCharCode(65 + index)} (${index}): "${header}"`)
    })
    
    console.log('\n=== E8 Markets Data by Column ===')
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(',')
      if (cells[0] && cells[0].trim() === 'E8 Markets') {
        cells.forEach((cell, index) => {
          const columnLetter = String.fromCharCode(65 + index)
          console.log(`  Column ${columnLetter} (${index}): "${cell}"`)
        })
        break
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugCSVColumns()