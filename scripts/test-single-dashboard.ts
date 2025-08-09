import { parseCSV, getContextualRanking } from './csv-parser'
import { generateDashboard } from './generate-dashboards'
import path from 'path'

// Test single dashboard generation
async function testSingleDashboard() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    // Get FTMO for test
    const ftmo = firms.find(f => f.firmName === 'FTMO')
    if (!ftmo) {
      console.error('FTMO not found')
      return
    }
    
    console.log('Testing single dashboard for FTMO...')
    
    // Get contextual ranking
    const contextual = getContextualRanking(firms, ftmo, 3, 1)
    
    // Generate dashboard
    await generateDashboard(
      ftmo,
      contextual,
      './output/test-single',
      'http://localhost:3001',
      { width: 1560, height: 850 }
    )
    
    console.log('✅ Test dashboard generated!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Start server manually first
console.log('Please start the server with: npm run dev')
console.log('Then run this test after server is ready.')

// Uncomment to run test
// testSingleDashboard()