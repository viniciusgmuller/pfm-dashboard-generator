#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testFundingPipsTraffic() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const fundingPips = firms.find(f => f.firmName === 'FundingPips')!
    
    console.log('=== FundingPips Traffic Data ===')
    console.log(`CFD Share (N): ${fundingPips.cfdShare}%`)
    console.log(`Expected display: exactly ${fundingPips.cfdShare}% (not rounded)`)
    console.log('')

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const competitors = getContextualRanking(firms, fundingPips, 3, 1)
    const firmDataParam = encodeURIComponent(JSON.stringify(fundingPips))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/${fundingPips.firmName.toLowerCase()}?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Taking FundingPips screenshot...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/data-test'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'FundingPips_traffic_precision.png') })
    
    console.log('✅ Screenshot saved: output/data-test/FundingPips_traffic_precision.png')
    console.log(`Should show exactly: ${fundingPips.cfdShare}%`)
    
    await browser.close()
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testFundingPipsTraffic()