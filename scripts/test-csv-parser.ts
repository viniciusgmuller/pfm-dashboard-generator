import { parseCSV, getContextualRanking } from './csv-parser'
import path from 'path'

// Test CSV parser
const csvPath = path.join(__dirname, '../data/weekly/data.csv')
console.log('Testing CSV parser with:', csvPath)

try {
  const firms = parseCSV(csvPath)
  console.log('\n✅ Successfully parsed CSV!')
  console.log(`Found ${firms.length} firms:\n`)
  
  // Show first firm details
  if (firms.length > 0) {
    console.log('First firm details:')
    console.log(JSON.stringify(firms[0], null, 2))
    
    // Test contextual ranking for Funding Pips
    const fundingPips = firms.find(f => f.firmName === 'Funding Pips')
    if (fundingPips) {
      console.log('\n\nContextual ranking for Funding Pips:')
      const contextual = getContextualRanking(firms, fundingPips, 3, 1)
      contextual.forEach((firm, index) => {
        console.log(`${index + 1}. ${firm.firmName} (Position #${firm.currentPosition})`)
      })
    }
  }
} catch (error) {
  console.error('❌ Error:', error)
}