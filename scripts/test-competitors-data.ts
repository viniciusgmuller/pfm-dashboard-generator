import { parseCSV, getContextualRanking } from './csv-parser'
import path from 'path'

// Test competitors data
const csvPath = path.join(__dirname, '../data/weekly/data.csv')
const firms = parseCSV(csvPath)

console.log('=== Testing FTMO Contextual Ranking ===\n')

const ftmo = firms.find(f => f.firmName === 'FTMO')!
console.log(`Target Firm: ${ftmo.firmName} (Position #${ftmo.currentPosition})`)

const contextual = getContextualRanking(firms, ftmo, 3, 1)

console.log('\nContextual Ranking (should show 5 firms):')
contextual.forEach((firm, index) => {
  console.log(`${index + 1}. ${firm.firmName} (#${firm.currentPosition})`)
  console.log(`   Revenue: $${firm.revenueCurrent.toLocaleString()}`)
  console.log(`   Favorites: ${firm.visitsPinkCurrent} (Col H)`)
  console.log(`   Visits: ${firm.cfdShare}% (Col N)`)
  console.log('')
})

// Verify expected firms around FTMO position #6
console.log('=== Expected Firms Around Position #6 ===')
const sorted = firms.sort((a, b) => a.currentPosition - b.currentPosition)
console.log('Positions 3-7:')
sorted.slice(2, 7).forEach(firm => {
  console.log(`#${firm.currentPosition}: ${firm.firmName}`)
  console.log(`   Revenue: $${firm.revenueCurrent.toLocaleString()}`)
  console.log(`   Favorites: ${firm.visitsPinkCurrent}`)
  console.log(`   Visits: ${firm.cfdShare}%`)
  console.log('')
})