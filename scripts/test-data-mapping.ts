import { parseCSV } from './csv-parser'
import path from 'path'

// Test data mapping
const csvPath = path.join(__dirname, '../data/weekly/data.csv')
const firms = parseCSV(csvPath)

console.log('=== Data Mapping Test ===\n')

// Test first 3 firms
firms.slice(0, 3).forEach((firm, index) => {
  console.log(`${index + 1}. ${firm.firmName}`)
  console.log(`   Position: ${firm.currentPosition}`)
  console.log(`   Revenue Current: $${firm.revenueCurrent.toLocaleString()}`)
  console.log(`   Favorites (visitsPinkCurrent - Col H): ${firm.visitsPinkCurrent}`)
  console.log(`   Traffic % (cfdShare - Col N): ${firm.cfdShare}%`)
  console.log(`   Raw data check:`)
  console.log(`   - visitsPinkPrevious (G): ${firm.visitsPinkPrevious}`)
  console.log(`   - visitsPinkCurrent (H): ${firm.visitsPinkCurrent}`)
  console.log(`   - trafficCurrent (L): ${firm.trafficCurrent}`)
  console.log(`   - cfdShare (N): ${firm.cfdShare}`)
  console.log('')
})

// Specific test for understanding the CSV columns
console.log('=== CSV Column Verification ===')
const testFirm = firms[0] // FundingPips
console.log(`Firm: ${testFirm.firmName}`)
console.log(`Expected: Favorites should be column H (Current Week visits)`)
console.log(`Expected: Traffic visits should be column N (% Share)`)
console.log(`Mapped favorites: ${testFirm.visitsPinkCurrent}`)
console.log(`Mapped traffic: ${testFirm.cfdShare}%`)