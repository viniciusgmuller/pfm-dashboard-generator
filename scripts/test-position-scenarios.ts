#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testPositionScenarios() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    // Test specific scenarios
    const testCases = [
      { firmName: 'FundingPips', position: 1 },
      { firmName: 'The5ers', position: 2 },
      { firmName: 'Alpha Capital', position: 4 },
      { firmName: 'Blueberry Funded', position: 20 }
    ]
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    for (const testCase of testCases) {
      const firm = firms.find(f => f.firmName === testCase.firmName)!
      
      console.log(`\n=== Testing ${firm.firmName} (Position ${firm.currentPosition}) ===`)
      
      const competitors = getContextualRanking(firms, firm)
      console.log('Contextual ranking:')
      competitors.forEach(f => {
        const displayName = f.firmName === firm.firmName ? f.firmName : '???'
        console.log(`  #${f.currentPosition} - ${displayName}`)
      })
      
      const firmDataParam = encodeURIComponent(JSON.stringify(firm))
      const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
      
      const url = `http://localhost:3002/dashboard/${firm.firmName.toLowerCase().replace(/\s+/g, '-')}?data=${firmDataParam}&competitors=${competitorsParam}`
      
      console.log(`📸 Taking screenshot for ${firm.firmName}...`)
      await page.goto(url, { waitUntil: 'networkidle2' })
      await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const outputDir = './output/position-tests'
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      const fileName = `${firm.firmName.replace(/\s+/g, '_')}_position_${firm.currentPosition}.png`
      await page.screenshot({ path: path.join(outputDir, fileName) })
      
      console.log(`✅ Screenshot saved: output/position-tests/${fileName}`)
    }
    
    await browser.close()
    console.log('\n🎉 All position scenario tests completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testPositionScenarios()