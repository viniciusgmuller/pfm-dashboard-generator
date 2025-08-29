import { parseCSV } from './csv-parser'
import path from 'path'

// Test traffic data mapping
const csvPath = path.join(__dirname, '../data/weekly/data.csv')
const firms = parseCSV(csvPath)

console.log('=== Traffic Card Data Mapping ===\n')

// Test first 3 firms
firms.slice(0, 3).forEach((firm, index) => {
  console.log(`${index + 1}. ${firm.firmName}`)
  console.log(`   Previous Week (Coluna K): ${firm.visitsAzulPrevious}`)
  console.log(`   Current Week (Coluna L): ${firm.trafficCurrent}`)
  console.log(`   CFD Share (Coluna N): ${firm.cfdShare}%`)
  console.log('')
})

console.log('=== Expected mapping for TrafficCard ===')
console.log('Previous Week Bar (cinza): Coluna K (visitsAzulPrevious)')
console.log('Current Week Bar (azul): Coluna L (trafficCurrent)')
console.log('CFD Share pie chart: Coluna N (cfdShare)')
console.log('')

console.log('=== Specific test for FTMO ===')
const ftmo = firms.find(f => f.firmName === 'FTMO')
if (ftmo) {
  console.log(`FTMO TrafficCard should show:`)
  console.log(`- Previous Week Bar: ${ftmo.visitsAzulPrevious}`)
  console.log(`- Current Week Bar: ${ftmo.trafficCurrent}`)
  console.log(`- CFD Share: ${ftmo.cfdShare}%`)
}