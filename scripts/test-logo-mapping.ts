import { getLogoIdFromFirmName, testLogoMappings } from '../lib/logoMapping'
import { parseCSV } from './csv-parser'
import path from 'path'

// Test logo mappings
console.log('=== Logo Mapping Tests ===\n')

// Test with predefined list
testLogoMappings()

console.log('\n=== CSV Firm Names Test ===\n')

// Test with actual CSV data
try {
  const csvPath = path.join(__dirname, '../data/weekly/data.csv')
  const firms = parseCSV(csvPath)
  
  console.log('Testing logo mappings for CSV firms:')
  firms.forEach((firm, index) => {
    const logoId = getLogoIdFromFirmName(firm.firmName)
    console.log(`${index + 1}. "${firm.firmName}" -> ${logoId}`)
  })
} catch (error) {
  console.error('Error testing CSV firms:', error)
}