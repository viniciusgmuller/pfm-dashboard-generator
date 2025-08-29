#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testE8CFDDisplay() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const e8Markets = firms.find(f => f.firmName === 'E8 Markets')!
    
    console.log('=== E8 Markets CFD Share Test ===')
    console.log(`E8 Markets CFD Share: ${e8Markets.cfdShare} (type: ${typeof e8Markets.cfdShare})`)
    console.log(`Expected display: exactly ${e8Markets.cfdShare}% in static mode`)
    console.log(`Expected display: ${e8Markets.cfdShare.toFixed(1)}% in dynamic mode`)
    
    const competitors = getContextualRanking(firms, e8Markets)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(e8Markets))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/e8-markets?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Taking E8 Markets CFD test screenshot...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/cfd-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'E8_Markets_CFD_Share_test.png') })
    
    console.log('✅ Screenshot saved: output/cfd-tests/E8_Markets_CFD_Share_test.png')
    console.log(`Should display: ${e8Markets.cfdShare}% (6.6% in static mode)`)
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testE8CFDDisplay()