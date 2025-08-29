#!/usr/bin/env npx tsx

import fs from 'fs/promises'
import path from 'path'
import { generateDashboard } from '../lib/dashboardGenerator'
import { parseCsvData } from '../lib/csvParser'

async function testPopularityRankingWithLogos() {
  console.log('Testing Popularity Ranking with Competitor Names and Logos...\n')

  // Load the CSV data
  const csvPath = path.join(process.cwd(), 'firms_data.csv')
  const csvContent = await fs.readFile(csvPath, 'utf-8')
  const csvData = parseCsvData(csvContent)

  // Test with a firm that has competitors above and below
  const testFirm = 'FundingPips'
  
  console.log(`Generating dashboard for ${testFirm}...`)
  console.log('This should show:')
  console.log('- Competitor names and logos (not "???")')
  console.log('- Blurred stats for competitors')
  console.log('- Clear stats for the target firm\n')

  const outputPath = path.join(process.cwd(), 'output/popularity-test', `${testFirm}_popularity_test.png`)
  
  await generateDashboard({
    firmName: testFirm,
    csvData,
    outputPath,
    width: 1920,
    height: 1080
  })

  console.log(`✓ Dashboard generated: ${outputPath}`)
  console.log('\nPlease check the image to verify:')
  console.log('1. Competitor firm names are visible')
  console.log('2. Competitor logos are displayed')
  console.log('3. Competitor stats (Revenue, Visits, Favorites) are blurred')
  console.log('4. Target firm stats are clear and highlighted')
}

testPopularityRankingWithLogos().catch(console.error)