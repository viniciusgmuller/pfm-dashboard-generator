#!/usr/bin/env node

import { parseCSV, getContextualRanking } from './csv-parser'
import path from 'path'

function testRankingLogic() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    // Sort firms by position to see the full ranking
    const sortedFirms = [...firms].sort((a, b) => a.currentPosition - b.currentPosition)
    
    console.log('=== Full Ranking ===')
    sortedFirms.forEach(firm => {
      console.log(`#${firm.currentPosition} - ${firm.firmName}`)
    })
    
    console.log('\n=== Testing Conditional Logic ===')
    
    // Test different positions
    const testPositions = [1, 2, 3, 4, sortedFirms.length - 1, sortedFirms.length]
    
    testPositions.forEach(position => {
      const firm = sortedFirms.find(f => f.currentPosition === position)
      if (firm) {
        const contextualRanking = getContextualRanking(firms, firm)
        
        console.log(`\nFirma na posição ${position} (${firm.firmName}):`)
        console.log('Ranking contextual:')
        contextualRanking.forEach(f => {
          const displayName = f.firmName === firm.firmName ? f.firmName : '???'
          console.log(`  #${f.currentPosition} - ${displayName}`)
        })
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testRankingLogic()