#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testE8FinalCFD() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const e8Markets = firms.find(f => f.firmName === 'E8 Markets')!
    
    console.log('=== E8 Markets Final CFD Test ===')
    console.log(`E8 Markets cfdShare: ${e8Markets.cfdShare}`)
    console.log(`E8 Markets cfdShareFormatted: "${e8Markets.cfdShareFormatted}"`)
    console.log(`Expected display in dashboard: ${e8Markets.cfdShareFormatted}`)
    
    const competitors = getContextualRanking(firms, e8Markets)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(e8Markets))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/e8-markets?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Taking FINAL E8 Markets CFD screenshot...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/final-cfd-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'E8_Markets_CFD_FINAL.png') })
    
    console.log('✅ Screenshot saved: output/final-cfd-tests/E8_Markets_CFD_FINAL.png')
    console.log(`MUST display: 6.60% (not 6.6%)`)
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testE8FinalCFD()