#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testFundingPipsCorrected() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const fundingPips = firms.find(f => f.firmName === 'FundingPips')!
    
    console.log('=== FundingPips (Position 1) - Corrected ===')
    const competitors = getContextualRanking(firms, fundingPips)
    console.log('Contextual ranking:')
    competitors.forEach(f => {
      const displayName = f.firmName === fundingPips.firmName ? f.firmName : '???'
      console.log(`  #${f.currentPosition} - ${displayName}`)
    })
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(fundingPips))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/fundingpips?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Taking corrected FundingPips screenshot...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/corrected-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'FundingPips_position_1_CORRECTED.png') })
    
    console.log('✅ Screenshot saved: output/corrected-tests/FundingPips_position_1_CORRECTED.png')
    console.log('Should show ONLY positions: #1 (FundingPips), #2, #3, #4, #5')
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testFundingPipsCorrected()