import { parseCSV, getContextualRanking } from './csv-parser'

// Test data generation
const firms = parseCSV('data/weekly/data.csv')
const fundingPips = firms.find(f => f.firmName === 'FundingPips')!
const competitors = getContextualRanking(firms, fundingPips, 3, 1)

// Generate URL parameters
const firmDataParam = encodeURIComponent(JSON.stringify(fundingPips))
const competitorsParam = encodeURIComponent(JSON.stringify(competitors))

// Build URL
const dashboardUrl = `http://localhost:3000/dashboard/fundingpips?data=${firmDataParam}&competitors=${competitorsParam}`

console.log('Test URL:')
console.log(dashboardUrl)
console.log('\nFirm data:')
console.log(JSON.stringify(fundingPips, null, 2))
console.log('\nCompetitors:')
console.log(JSON.stringify(competitors.map(c => c.firmName), null, 2))